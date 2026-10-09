import express from "express";
import cors from "cors";
import { Readable } from "node:stream";

const app = express();
const PORT = 3001;

const BACKEND_URL = (
  process.env.DRISTIGATI_BACKEND_URL || ""
).replace(/\/+$/, "");

const API_SECRET = process.env.DRISTIGATI_API_SECRET;

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

if (!BACKEND_URL || !API_SECRET) {
  throw new Error(
    "Set DRISTIGATI_BACKEND_URL and DRISTIGATI_API_SECRET first."
  );
}

// ---------------- GREEN / HOLD DECISIONS ----------------

app.post("/api/decision", async (req, res) => {
  try {
    const upstream = await fetch(
      `${BACKEND_URL}/api/decision`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Secret": API_SECRET
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await upstream.json().catch(() => ({
      error: "Invalid response from backend"
    }));

    res.status(upstream.status).json(data);

  } catch (error) {
    console.error("Decision request failed:", error.message);

    res.status(502).json({
      error: "Could not reach DristiGati backend"
    });
  }
});

// ---------------- LIVE VIDEO STREAM ----------------

app.get("/api/video", async (req, res) => {
  let stream;

  try {
    const upstream = await fetch(
      `${BACKEND_URL}/api/video`,
      {
        method: "GET",
        headers: {
          "X-API-Secret": API_SECRET
        },
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!upstream.ok || !upstream.body) {
      const message = await upstream.text().catch(() => "");

      return res.status(upstream.status || 502).send(
        message || "Video stream unavailable"
      );
    }

    res.status(200);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") ||
        "multipart/x-mixed-replace; boundary=frame"
    );
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    stream = Readable.fromWeb(upstream.body);

    stream.on("error", (error) => {
      if (!res.destroyed) {
        console.error("Video stream error:", error.message);
        res.destroy(error);
      }
    });

    res.on("close", () => {
      stream.destroy();
    });

    stream.pipe(res);

  } catch (error) {
    if (stream) {
      stream.destroy();
    }

    console.error("Video proxy failed:", error.message);

    if (!res.headersSent) {
      res.status(502).send(
        "Could not connect to DristiGati video stream"
      );
    } else if (!res.destroyed) {
      res.destroy();
    }
  }
});

// ---------------- START LOCAL BRIDGE ----------------

app.listen(PORT, "127.0.0.1", () => {
  console.log(`DristiGati bridge running on port ${PORT}`);
  console.log("Decision endpoint: /api/decision");
  console.log("Video endpoint: /api/video");
});