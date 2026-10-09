import cv2
from ultralytics import YOLO

model = YOLO("yolo11n.pt")

camera = cv2.VideoCapture(0)

while True:
    success, frame = camera.read()

    if not success:
        print("Could not access camera.")
        break

    results = model(frame, verbose=False)

    height, width = frame.shape[:2]

    # Divide camera into LEFT / CENTER / RIGHT
    left_boundary = width // 3
    right_boundary = 2 * width // 3

    # Draw the three sections
    cv2.line(frame, (left_boundary, 0),
             (left_boundary, height), (255, 255, 255), 2)

    cv2.line(frame, (right_boundary, 0),
             (right_boundary, height), (255, 255, 255), 2)

    decision = "PATH CLEAR"

    for box in results[0].boxes:

        confidence = float(box.conf[0])

        # Ignore uncertain detections
        if confidence < 0.50:
            continue

        x1, y1, x2, y2 = map(int, box.xyxy[0])

        # Find object position
        object_center_x = (x1 + x2) // 2

        if object_center_x < left_boundary:
            position = "LEFT"

        elif object_center_x > right_boundary:
            position = "RIGHT"

        else:
            position = "CENTER"

        # Calculate how much of the screen the object occupies
        object_width = x2 - x1
        object_height = y2 - y1

        object_area = object_width * object_height
        screen_area = width * height

        area_percentage = object_area / screen_area

        # Large object = potentially close obstacle
        if area_percentage > 0.20 and position == "CENTER":
           decision = "CENTER BLOCKED"

           print(
                "BLOCKED:",
                "position =", position,
                "| area =", round(area_percentage * 100, 1), "%",
                "| confidence =", round(confidence, 2)
            )

        # Draw bounding box
        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2
        )

        # Show position
        cv2.putText(
            frame,
            position,
            (x1, max(y1 - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

    # Show navigation decision
    cv2.putText(
        frame,
        decision,
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 0, 255),
        3
    )

    cv2.imshow("DristiGati - Navigation Test", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camera.release()
cv2.destroyAllWindows()