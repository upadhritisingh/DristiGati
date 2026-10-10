from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from threading import Lock
import threading
import os
import time
import logging
import hmac
import cv2
import numpy as np

app = Flask(__name__)

# Enable CORS for dashboard/backend requests
CORS(app)

# Read the shared secret from an environment variable
API_SECRET = os.environ.get("DRISTIGATI_API_SECRET")

if not API_SECRET:
    raise RuntimeError(
        "Set DRISTIGATI_API_SECRET before starting the server"
    )

# Shared state and thread locks
lock = Lock()
frame_lock = threading.Lock()

latest_frame = None

state = {
    "mode": "SCANNING",
    "person_detected": False,
    "detection_zone": None,
    "decision": "NONE"
}


def authorized_request():
    supplied_secret = request.headers.get("X-API-Secret", "")
    return hmac.compare_digest(supplied_secret, API_SECRET)


# ---------------- STATUS ----------------

@app.get("/api/status")
def get_status():
    with lock:
        return jsonify(state.copy())


# ---------------- VIDEO FRAME UPLOAD ----------------

@app.post("/api/video-frame")
def receive_video_frame():
    global latest_frame

    if not authorized_request():
        return jsonify({"error": "Unauthorized"}), 401

    if not request.data:
        return jsonify({"error": "Empty frame"}), 400

    # Decode uploaded JPEG bytes into an OpenCV image
    frame_array = np.frombuffer(request.data, dtype=np.uint8)
    frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({"error": "Invalid image"}), 400

    with frame_lock:
        latest_frame = frame

    return jsonify({"message": "Frame received"})


def generate_video():
    while True:
        with frame_lock:
            frame = (
                latest_frame.copy()
                if latest_frame is not None
                else None
            )

        if frame is None:
            time.sleep(0.1)
            continue

        success, encoded = cv2.imencode(
            ".jpg",
            frame,
            [int(cv2.IMWRITE_JPEG_QUALITY), 70]
        )

        if not success:
            time.sleep(0.05)
            continue

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + encoded.tobytes()
            + b"\r\n"
        )


# ---------------- LIVE VIDEO STREAM ----------------

@app.get("/api/video")
def video_feed():
    # The local Node bridge must forward this secret header.
    if not authorized_request():
        return jsonify({"error": "Unauthorized"}), 401

    return Response(
        generate_video(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-store"}
    )


# ---------------- PERSON DETECTION ----------------

@app.post("/api/detection")
def report_detection():
    data = request.get_json(silent=True) or {}
    zone = data.get("zone", "UNKNOWN")

    with lock:
        state["person_detected"] = True
        state["detection_zone"] = zone
        state["mode"] = "WAITING_FOR_HUMAN"
        state["decision"] = "NONE"

    print(f"Detection reported in zone: {zone}")
    print("Waiting for human confirmation.")

    return jsonify({
        "message": "Detection recorded",
        "mode": "WAITING_FOR_HUMAN"
    })



# ---------------- HUMAN DECISION ----------------

@app.post("/api/decision")
def receive_decision():
    if not authorized_request():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    decision = data.get("decision")

    if decision not in ["GREEN", "HOLD"]:
        return jsonify({
            "error": "Use GREEN or HOLD"
        }), 400

    with lock:
        current_mode = state["mode"]

        # GREEN: confirm a detection OR resume from hold
        if decision == "GREEN":
            if current_mode not in ["WAITING_FOR_HUMAN", "ON_HOLD"]:
                return jsonify({
                    "error": "Mission is not awaiting confirmation or on hold",
                    "mode": current_mode
                }), 409

            state["decision"] = "GREEN"
            state["mode"] = "SCANNING"
            state["person_detected"] = False
            state["detection_zone"] = None

        # HOLD: only valid when a detection awaits confirmation
        elif decision == "HOLD":
            if current_mode != "WAITING_FOR_HUMAN":
                return jsonify({
                    "error": "No pending detection to hold",
                    "mode": current_mode
                }), 409

            state["decision"] = "HOLD"
            state["mode"] = "ON_HOLD"

        new_mode = state["mode"]

    print(f"Operator decision received: {decision}")
    print(f"Current mode: {new_mode}")

    return jsonify({
        "message": "Decision received",
        "mode": new_mode
    })

# ---------------- START SERVER ----------------

if __name__ == "__main__":
    print("DristiGati control server starting...")
    print("Backend: http://127.0.0.1:5000")
    print("Video upload: /api/video-frame")
    print("Video stream: /api/video")

    # Hide routine HTTP request logs from the terminal
    logging.getLogger("werkzeug").setLevel(logging.WARNING)
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False,
        threaded=True
    )
