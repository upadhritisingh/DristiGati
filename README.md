# DristiGati - Autonomy Beyond the Map

**Vision-Based Autonomous Robot for Search and Rescue**

DristiGati is a vision-guided robotics project designed to assist search-and-rescue operations in challenging environments, such as disaster-hit buildings and debris zones. It aims to help identify possible survivors, communicate their detected locations, and support human-supervised navigation.

## Project Overview

In a search-and-rescue mission, an operator defines an objective, such as finding a person in a debris-filled area. The robot's vision system observes its surroundings, searches for relevant targets, and reports detections to the operator for review.

DristiGati combines a dashboard, a Python backend, vision-processing modules, and a simulated hardware circuit as part of its prototype.

## Key Features

- **Vision-based detection:** Designed to identify people or other mission-relevant objects.
- **Live camera feed:** Displays the camera stream on the dashboard.
- **Mission dashboard:** Shows mission status, camera information, alerts, and activity.
- **Human-in-the-loop control:** Allows the operator to hold on a detection or resume the mission.
- **Backend communication:** Uses a Flask API and a local Node.js bridge to connect the dashboard to the backend.
- **Hardware prototyping:** Includes a Tinkercad circuit simulation for exploring the electronics setup.

> Note: Features depend on the active hardware, vision pipeline, and runtime configuration. A dashboard detection alert alone does not establish that autonomous real-world rescue navigation is fully operational.

## Tinkercad Circuit Simulation

Explore the DristiGati hardware simulation:

**[DristiGati Tinkercad Circuit](https://www.tinkercad.com/things/38MJ6aRbAsh/editel?returnTo=%2Fdashboard%2Ftutorials&sharecode=RdDsthyedUogm1xrRxi0BJMlIeP5r4yZt-Sz2ePH8F8)**

Access depends on the circuit's Tinkercad sharing permissions. If the link requests an account or edit access, the owner may need to adjust the sharing settings.

## Technology Stack

- **Frontend:** React, Vite, JavaScript
- **Backend:** Python, Flask
- **Bridge server:** Node.js
- **Computer vision:** YOLO-based detection modules
- **Hardware prototyping:** Tinkercad Circuits

## Repository Structure

```text
DristiGati/
├── control_server.py
├── dristigati_brain.py
├── navigation_test.py
├── yolo_camera.py
├── requirements.txt
├── README.md
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── bridge.js
    └── src/
        ├── App.jsx
        ├── components/
        ├── data/
        └── ...
```

The structure above is representative. Some files or folders may differ depending on the latest repository version.

## Getting Started

### Prerequisites

Install:

- Python 3
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/upadhritisingh/DristiGati.git
cd DristiGati
```

### 2. Install backend dependencies

```bash
pip install -r requirements.txt
```

If a Python dependency file is missing or incomplete, install the project's required packages before starting the backend.

### 3. Configure the API secret

The backend uses an API secret to authorize protected requests. Set the same secret for the backend and bridge using environment variables.

Do not commit real secrets to GitHub. Configure them locally or through the deployment platform's secret-management settings.

### 4. Start the Flask backend

In a terminal, from the project root:

```bash
python control_server.py
```

On Windows, `py control_server.py` may be used instead.

### 5. Start the bridge server

Open another terminal:

```bash
cd frontend
```

Configure the bridge to use the backend's reachable address and the same API secret.

For a local two-process setup, the backend URL may be configured as:

```text
http://127.0.0.1:5000
```

Then start the bridge:

```bash
node bridge.js
```

For a two-laptop setup, use the backend laptop's reachable LAN address instead of `127.0.0.1`.

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal, typically:

```text
http://localhost:5173
```

The frontend, bridge, and backend must all be running, with their addresses and API secret configured consistently.

## Safety and Security

- Never commit `.env` files, API secrets, access tokens, or passwords.
- Keep `node_modules/`, build output, Python caches, and virtual environments out of version control.
- Use `.env.example` for placeholder configuration names only; never include real credentials.
- Restrict access to deployed control endpoints and use appropriate authentication.
- Test commands in simulation before connecting them to physical robot hardware.

## Current Prototype Scope

DristiGati is being developed as a prototype for vision-guided, human-supervised search and rescue. The dashboard and backend provide a foundation for mission monitoring and operator decisions. Actual autonomous navigation, reliable survivor localization, and physical motor control must be validated with the relevant hardware and perception pipeline.

## Team TriLogic

**Project:** DristiGati  
**Tagline:** Autonomy Beyond the Map.  
**Challenge:** Hack in Hills '26

---

*Built to explore how vision, robotics, and human-supervised autonomy can support search-and-rescue operations.*
