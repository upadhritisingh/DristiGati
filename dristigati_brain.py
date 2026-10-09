
from ultralytics import YOLO
import cv2
import requests
import time

SERVER_URL = "http://127.0.0.1:5000"

model = YOLO("yolo11n.pt")
camera = cv2.VideoCapture(0)

if not camera.isOpened():
    print("Error: Could not open camera.")
    raise SystemExit

def report_person_detection(zone):
    try:
        response = requests.post(
            f"{SERVER_URL}/api/detection",
            json={"zone": zone},
            timeout=2
        )
        print("Detection report:", response.json())
        return response.status_code == 200
    except requests.RequestException as error:
        print("Server connection error:", error)
        return False

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

print("DristiGati Rescue Brain Started")
print("Press Q to quit.")

reported_this_pause = False

while True:
    success, frame = camera.read()

    if not success:
        print("Camera frame unavailable.")
        break

    height, width = frame.shape[:2]
    left_boundary = width // 3
    right_boundary = 2 * width // 3

    cv2.line(frame, (left_boundary, 0),
             (left_boundary, height), (255, 255, 0), 2)
    cv2.line(frame, (right_boundary, 0),
             (right_boundary, height), (255, 255, 0), 2)

    status = get_server_status()

    if status is None:
        action = "SERVER DISCONNECTED"
        cv2.putText(
            frame, action, (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7,
            (0, 0, 255), 2
        )
        cv2.imshow("DristiGati Rescue Brain", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        continue

    mode = status["mode"]

    # Only run fresh detections while the server permits scanning.
    if mode == "SCANNING":
        results = model(frame, verbose=False, conf=0.5)
        person_found = False

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(
                    int, box.xyxy[0].tolist()
                )

                label_id = int(box.cls[0])
                label = model.names[label_id]
                center_x = (x1 + x2) // 2

                if center_x < left_boundary:
                    zone = "LEFT"
                elif center_x < right_boundary:
                    zone = "CENTER"
                else:
                    zone = "RIGHT"

                cv2.rectangle(
                    frame, (x1, y1), (x2, y2),
                    (0, 255, 0), 2
                )
                cv2.putText(
                    frame, f"{label} - {zone}",
                    (x1, max(y1 - 10, 20)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    (0, 255, 0), 2
                )

                if label == "person":
                    person_found = True

                    # Report once, then wait for server confirmation.
                    if not reported_this_pause:
                        if report_person_detection(zone):
                            reported_this_pause = True
                            mode = "WAITING_FOR_HUMAN"
                    break

            if person_found:
                break

        if person_found:
            action = "PERSON DETECTED - PAUSING"
        else:
            action = "SCANNING"

    elif mode == "WAITING_FOR_HUMAN":
        action = "WAITING FOR HUMAN - HOLD"

    elif mode == "ON_HOLD":
        action = "ON HOLD - OPERATOR DECISION NEEDED"

    else:
        action = f"MODE: {mode}"

    # Draw current mission state
    cv2.rectangle(
        frame, (10, 10), (width - 10, 58), (30, 30, 30), -1
    )
    cv2.putText(
        frame, f"DRISTIGATI: {action}",
        (20, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.65,
        (0, 255, 255), 2
    )

    cv2.imshow("DristiGati Rescue Brain", frame)

    # Check the operator's decision again next frame.
    if mode == "SCANNING":
        reported_this_pause = False

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

    time.sleep(0.02)

camera.release()
cv2.destroyAllWindows()