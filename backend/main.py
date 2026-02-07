import cv2
import asyncio
import numpy as np
import uvicorn
import os
import json
import time
import shutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from typing import List

from src.detection.detector_with_tracking import DroneDetectorTracker

# --- Global State ---
class GlobalState:
    drone_system = None
    camera = None

state = GlobalState()

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# --- Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Initializing AI Models...")
    try:
        # Load the requested yolov8s.pt model via DroneDetectorTracker
        model_path = "yolov8s.pt"
        print(f"Loading model: {model_path}")
        # Initialize DroneDetectorTracker
        # Note: restricted_zones can be passed if needed later
        state.drone_system = DroneDetectorTracker(model_path=model_path)
        
        # Initialize video capture (0 for webcam, or path to file)
        # For demo purposes, we will try to use webcam 0. 
        # If not available, we might need a fallback.
        # TEST MODE: Using uploaded video file
        video_path = "uploads/2a0e3c36-259c-43c3-840e-dcc224c44b32_WhatsApp Video 2026-02-07 at 19.51.36.mp4"
        if os.path.exists(video_path):
            print(f"Using video file: {video_path}")
            state.camera = cv2.VideoCapture(video_path)
        else:
            print("Video file not found, trying webcam...")
            state.camera = cv2.VideoCapture(0)

        if not state.camera.isOpened():
             print("Warning: Camera 0 not found. Using test video or placeholder.")
             # Fallback logic could be added here
        print("AI Models Initialized.")
    except Exception as e:
        print(f"Error initializing models: {e}")
    
    yield
    
    # Shutdown
    if state.camera:
        state.camera.release()
    print("Cleaned up resources.")

app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---

# Mount static files to serve processed videos
app.mount("/videos", StaticFiles(directory="outputs"), name="videos")

@app.get("/")
def read_root():
    return {"status": "running", "service": "YOLOv8 Surveillance Backend"}

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

def generate_frames():
    while True:
        if state.camera is None or not state.camera.isOpened():
             time.sleep(1)
             continue
        
        success, frame = state.camera.read()
        if not success:
            # If video ends, loop it or just wait
            state.camera.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
        
        # Process frame using the new system
        if state.drone_system:
            tracks, annotated_frame, alerts = state.drone_system.process_frame(frame)
            
            # Broadcast alerts via WebSocket if any
            if alerts:
                # We need an async loop to broadcast, but generate_frames is sync generator.
                # In a real app, this would be handled differently (e.g., background task).
                # Skipping broadcast here for simplicity or using run_in_executor if needed.
                pass
        else:
            annotated_frame = frame
        
        # Encode
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    # 1. Save uploaded file
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)
    
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    print(f"Video uploaded: {file_location}")

    # 2. Process Video
    cap = cv2.VideoCapture(file_location)
    if not cap.isOpened():
        return {"error": "Could not open video file"}

    # Video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    # Output path
    output_filename = f"processed_{file.filename}"
    output_path = f"outputs/{output_filename}"
    
    # Initialize VideoWriter
    # avc1 codec is better for browser compatibility
    fourcc = cv2.VideoWriter_fourcc(*'avc1') 
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    print(f"Processing video to {output_path}...")
    
    # Reset system frame count for new video if needed, or create a new instance?
    # Ideally we should create a new instance per video analysis request to avoid state leaking from live feed.
    # But for now, let's use a fresh instance for this request to be safe.
    # We can reuse the model loaded in state to avoid reloading weights, but tracking state is per-video.
    # So let's instantiate a new DroneDetectorTracker sharing the model?
    # Actually, simpler is just to create a new instance. Loading model is fast if cached by YOLO.
    
    # Create a dedicated processor for this video
    video_processor = DroneDetectorTracker(model_path="yolov8s.pt")
    
    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        try:
            # Process frame
            tracks, annotated_frame, alerts = video_processor.process_frame(frame)
            
            # Write to output video
            out.write(annotated_frame)
        except Exception as e:
            print(f"Error processing frame {frame_count}: {e}")
            out.write(frame) # Write original frame if detection fails

        frame_count += 1
        if frame_count % 30 == 0:
            print(f"Processed {frame_count} frames")

    # Release resources
    cap.release()
    out.release()
    
    # Get analysis results
    stats = video_processor.alert_manager.get_statistics()
    alerts = video_processor.alert_manager.alerts
    
    print("Video analysis complete.")
    
    return {
        "message": "Video analysis complete.",
        "job_id": str(int(time.time())), 
        "output_video_path": output_filename,
        "stats": stats,
        "alerts": alerts
    }

@app.get("/stats")
def get_stats():
    # Return real stats from alert_manager
    stats = {
        "total_detections": 0,
        "current_occupancy": 0,
        "hourly_breakdown": [0] * 24, # Mock hourly for now, could be derived from alerts timestamps
        "total_alerts": 0,
        "high_alerts": 0,
        "medium_alerts": 0,
        "low_alerts": 0,
        "recent_alerts": []
    }

    if state.drone_system:
        # Get tracker stats
        if state.drone_system.tracker:
            stats["total_detections"] = len(state.drone_system.tracker.tracks)
        
        # Get alert stats
        if state.drone_system.alert_manager:
            alert_stats = state.drone_system.alert_manager.get_statistics()
            stats.update(alert_stats)
            # Get recent alerts for feed
            stats["recent_alerts"] = state.drone_system.alert_manager.alerts[-10:] if state.drone_system.alert_manager.alerts else []

    return stats

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
