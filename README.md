# DristiGati

**Vision-Based Rescue Robot Prototype | Hack in Hills ’26**

DristiGati is a prototype concept for assisting search-and-rescue teams in hazardous environments. It uses computer vision to detect people, communicates detection information to a backend server, and allows a human operator to make a decision through a dashboard.

## Project Goals

* Detect people using a camera and YOLO-based computer vision.
* Divide the camera view into LEFT, CENTER, and RIGHT zones for basic directional awareness.
* Send detection information to a Flask backend.
* Allow a human operator to approve or hold a decision.
* Explore obstacle detection and motor-control logic through an Arduino/Tinkercad simulation.

## Current Prototype Components

| File                  | Purpose                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `dristigati_brain.py` | Main computer-vision and decision-logic prototype                 |
| `control_server.py`   | Flask API for detection reports, status, and human decisions      |
| `navigation_test.py`  | Tests camera-based detection across LEFT, CENTER, and RIGHT zones |
| `yolo_camera.py`      | Camera feed and YOLO detection test                               |
| `requirements.txt`    | Python dependencies                                               |

## Requirements

* Python 3.10 or another Python version supported by the installed Ultralytics and OpenCV packages
* A webcam for camera-based tests
* Internet access for installing dependencies and downloading YOLO model weights if needed

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/upadhritisingh/DristiGati.git
cd DristiGati
```

### 2. Create and activate a virtual environment (recommended)

Windows:

```bash
py -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies

```bash
py -m pip install -r requirements.txt
```

### 4. Run the backend server

```bash
py control_server.py
```

The server is expected to run at:

`http://127.0.0.1:5000`

Keep this terminal open while using the API.

## API Endpoints

### Check server status

`GET /api/status`

Example:

```bash
curl http://127.0.0.1:5000/api/status
```

### Report a detection

`POST /api/detection`

Example JSON body:

```json
{
  "zone": "CENTER"
}
```

### Submit a human decision

`POST /api/decision`

Example JSON body:

```json
{
  "decision": "GREEN"
}
```

Supported decisions in the current prototype: `GREEN` and `HOLD`. A decision may be accepted only when the server is in the appropriate waiting state.

## Running the Camera Tests

Run each script separately:

```bash
py yolo_camera.py
```

```bash
py navigation_test.py
```

Run the main decision-logic prototype separately:

```bash
py dristigati_brain.py
```

Camera scripts require webcam access. The brain script may also require the Flask server to be running, depending on its current configuration.

## Dashboard Integration

The frontend dashboard is being developed separately.

The intended integration is:

1. The dashboard requests `GET /api/status` to display backend state.
2. When a person is detected, the backend reports the detection zone.
3. The dashboard's GREEN action sends `POST /api/decision` with `{"decision": "GREEN"}`.
4. The HOLD action sends `POST /api/decision` with `{"decision": "HOLD"}`.

**Important:** `127.0.0.1` refers to the machine running the request. If the dashboard runs on a different device, or in a browser with a different origin, the server address, network access, and CORS configuration may need adjustment.

## Simulation and Limitations

The Arduino obstacle-detection and motor-control circuit is a separate Tinkercad simulation. It demonstrates simulated distance sensing and motor-control logic; it is not proof of a completed physical robot.

This repository represents a software prototype. Autonomous movement in real debris environments, reliable victim detection, localization, and hardware integration require further development and testing.

## Team Workflow

* Use GitHub to share code and coordinate updates.
* Test backend changes locally before integrating them with the dashboard.
* Do not commit virtual environments, large generated model files, recordings, credentials, or API keys.

## Project

Developed for **Hack in Hills ’26**.
