import cv2
from ultralytics import YOLO

# Load a pre-trained YOLO model
model = YOLO("yolo11n.pt")

# Open laptop camera
camera = cv2.VideoCapture(0)

while True:
    success, frame = camera.read()

    if not success:
        print("Could not access camera.")
        break

    # Ask YOLO to detect objects in the frame
    results = model(frame)

    # Draw the detections on the video
    annotated_frame = results[0].plot()

    cv2.imshow("DristiGati - AI Vision", annotated_frame)

    # Press Q to quit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camera.release()
cv2.destroyAllWindows()