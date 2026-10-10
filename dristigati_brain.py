
import os
import time
import threading

import cv2
import requests
from ultralytics import YOLO


# ---------------- CONFIGURATION ----------------

SERVER_URL = "http://127.0.0.1:5000"
API_SECRET = os.environ.get("DRISTIGATI_API_SECRET")

MODEL_NAME = "yolo11n.pt"
CAMERA_INDEX = 0

# Upload video to the dashboard at approximately 5 FPS
VIDEO_UPLOAD_INTERVAL = 0.2
JPEG_QUALITY = 65

# Only report a detection once per scanning cycle
DETECTION_CONFIDENCE = 0.50

if not API_SECRET:
    raise RuntimeError(
        "DRISTIGATI_API_SECRET is missing. "
        "Set it in this terminal before starting the brain."
    )

HEADERS = {"X-API-Secret": API_SECRET}


# ---------------- SHARED CAMERA FRAME ----------------

latest_frame = None
frame_lock = threading.Lock()
stop_event = threading.Event()


# ---------------- BACKEND HELPERS ----------------

def get_server_status():
    try:
        response = requests.get(
            f"{SERVER_URL}/api/status",
            timeout=1
        )
        response.raise_for_status()
        return response.json()

    except requests.RequestException:
        return None


def report_person_detection(zone):
    try:
        response = requests.post(
            f"{SERVER_URL}/api/detection",
            json={"zone": zone},
            timeout=2
        )
        response.raise_for_status()
        print(f"Detection sent to backend: {zone}")
        return True

    except requests.RequestException as error:
        print(f"Could not report detection: {error}")
        return False


# ---------------- VIDEO UPLOAD THREAD ----------------

def upload_video_frames():
    session = requests.Session()
    session.headers.update(HEADERS)

    while not stop_event.is_set():
        with frame_lock:
            frame = (
                latest_frame.copy()
                if latest_frame is not None
                else None
            )

        if frame is None:
            stop_event.wait(0.1)
            continue

        try:
            encoded_ok, jpeg = cv2.imencode(
                ".jpg",
                frame,
                [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY]
            )

            if encoded_ok:
                session.post(
                    f"{SERVER_URL}/api/video-frame",
                    data=jpeg.tobytes(),
                    headers={"Content-Type": "image/jpeg"},
                    timeout=1
                ).raise_for_status()

        except requests.RequestException:
            # Avoid flooding the console if the backend is temporarily down
            pass

        except Exception as error:
            print(f"Video upload error: {error}")

        stop_event.wait(VIDEO_UPLOAD_INTERVAL)

    session.close()


# ---------------- MAIN PROGRAM ----------------

def main():
    global latest_frame

    print("Loading DristiGati vision model...")
    model = YOLO(MODEL_NAME)

    camera = cv2.VideoCapture(CAMERA_INDEX)

    if not camera.isOpened():
        print("ERROR: Could not open camera.")
        print("Close other apps using the camera and try again.")
        return

    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    upload_thread = threading.Thread(
        target=upload_video_frames,
        daemon=True
    )
    upload_thread.start()

    print("DristiGati brain is running.")
    print("Press Q in the camera window to quit.")

    detection_reported = False
    last_status_check = 0
    status = {"mode": "SCANNING"}

    try:
        while True:
            success, frame = camera.read()

            if not success:
                print("Camera frame unavailable.")
                time.sleep(0.2)
                continue

            # Check the backend status periodically
            now = time.monotonic()

            if now - last_status_check >= 0.25:
                new_status = get_server_status()

                if new_status is not None:
                    status = new_status

                last_status_check = now

            mode = status.get("mode", "SCANNING")

            # Run person detection only while scanning
            if mode == "SCANNING":
                results = model(
                    frame,
                    classes=[0],  # COCO class 0 = person
                    conf=DETECTION_CONFIDENCE,
                    verbose=False
                )

                person_found = False
                height, width = frame.shape[:2]

                for result in results:
                    for box in result.boxes:
                        x1, y1, x2, y2 = map(
                            int,
                            box.xyxy[0].tolist()
                        )

                        confidence = float(box.conf[0])
                        center_x = (x1 + x2) // 2

                        if center_x < width // 3:
                            zone = "LEFT"
                        elif center_x < 2 * width // 3:
                            zone = "CENTER"
                        else:
                            zone = "RIGHT"

                        cv2.rectangle(
                            frame,
                            (x1, y1),
                            (x2, y2),
                            (0, 255, 0),
                            2
                        )

                        cv2.putText(
                            frame,
                            f"Person {confidence:.2f} - {zone}",
                            (x1, max(y1 - 10, 20)),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.55,
                            (0, 255, 0),
                            2
                        )

                        person_found = True

                if person_found and not detection_reported:
                    if report_person_detection(zone):
                        detection_reported = True
                        status = {
                            "mode": "WAITING_FOR_HUMAN",
                            "person_detected": True,
                            "detection_zone": zone
                        }

            # Refresh status after a reported detection
            if status.get("mode") == "WAITING_FOR_HUMAN":
                latest_status = get_server_status()

                if latest_status is not None:
                    status = latest_status

            mode = status.get("mode", "SCANNING")

            # Allow a new detection after GREEN resets the scan
            if mode == "SCANNING":
                detection_reported = False

            # Draw visual thirds for approximate detection zones
            height, width = frame.shape[:2]
            cv2.line(
                frame,
                (width // 3, 0),
                (width // 3, height),
                (255, 180, 0),
                1
            )
            cv2.line(
                frame,
                (2 * width // 3, 0),
                (2 * width // 3, height),
                (255, 180, 0),
                1
            )

            # Draw current robot mode
            cv2.rectangle(frame, (0, 0), (width, 40), (25, 25, 25), -1)

            cv2.putText(
                frame,
                f"DRISTIGATI | MODE: {mode}",
                (10, 27),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.65,
                (0, 255, 255),
                2
            )

            if mode == "WAITING_FOR_HUMAN":
                cv2.putText(
                    frame,
                    "PERSON DETECTED - AWAITING OPERATOR",
                    (10, height - 20),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.55,
                    (0, 165, 255),
                    2
                )

            elif mode == "ON_HOLD":
                cv2.putText(
                    frame,
                    "MISSION ON HOLD",
                    (10, height - 20),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.65,
                    (0, 0, 255),
                    2
                )

            # Publish the processed frame for the upload thread
            with frame_lock:
                latest_frame = frame.copy()

            cv2.imshow("DristiGati Rescue Brain", frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    except KeyboardInterrupt:
        print("\nStopping DristiGati brain...")

    finally:
        stop_event.set()
        camera.release()
        cv2.destroyAllWindows()
        upload_thread.join(timeout=2)
        print("DristiGati brain stopped.")


if __name__ == "__main__":
    main()
