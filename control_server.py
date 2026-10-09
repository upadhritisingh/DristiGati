
from flask import Flask, jsonify, request
from flask_cors import CORS
from threading import Lock

app = Flask(__name__)
CORS(app)

lock = Lock()

state = {
    "mode": "SCANNING",
    "person_detected": False,
    "detection_zone": None,
    "decision": "NONE"
}


@app.get("/api/status")
def get_status():
    with lock:
        return jsonify(state.copy())


@app.post("/api/detection")
def report_detection():
    data = request.get_json(silent=True) or {}

    with lock:
        state["person_detected"] = True
        state["detection_zone"] = data.get("zone", "UNKNOWN")
        state["mode"] = "WAITING_FOR_HUMAN"
        state["decision"] = "NONE"

    print("Person detection reported. Waiting for human confirmation.")

    return jsonify({
        "message": "Detection recorded",
        "mode": "WAITING_FOR_HUMAN"
    })


@app.post("/api/decision")
def receive_decision():
    data = request.get_json(silent=True) or {}
    decision = data.get("decision")

    if decision not in ["GREEN", "HOLD"]:
        return jsonify({"error": "Use GREEN or HOLD"}), 400

    with lock:
        if state["mode"] != "WAITING_FOR_HUMAN":
            return jsonify({
                "error": "No pending detection requires confirmation"
            }), 409

        if decision == "GREEN":
            state["mode"] = "SCANNING"
            state["person_detected"] = False
            state["detection_zone"] = None
            state["decision"] = "GREEN"
        else:
            state["mode"] = "ON_HOLD"
            state["decision"] = "HOLD"

    print(f"Operator decision received: {decision}")

    return jsonify({
        "message": "Decision received",
        "mode": state["mode"]
    })


if __name__ == "__main__":
    print("DristiGati control server starting...")
    app.run(host="127.0.0.1", port=5000, debug=False)