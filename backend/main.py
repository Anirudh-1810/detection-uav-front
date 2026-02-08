import cv2
import asyncio
import numpy as np
import uvicorn
import os
import json
import time
import shutil
import re
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
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
        # Load the requested best.pt model via DroneDetectorTracker
        # SWITCHING TO YOLOv8s TEMPORARILY AS best.pt IS NOT DETECTING
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
from ultralytics import YOLO
import io
from PIL import Image
import os
from dotenv import load_dotenv
import google.generativeai as genai
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime
import uuid

# Load environment variables
load_dotenv()

# app = FastAPI() # Removed to use the instance with lifespan defined above

# Allow CORS for frontend
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
# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
genai_model = None

# --- MongoDB Setup ---
import pymongo
from pymongo.errors import ConnectionFailure
import certifi

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/uav_detection")
mongo_client = None
db = None
analysis_collection = None

try:
    # Connect to MongoDB (Atlas or Local)
    # FORCED SSL BYPASS: Creating a custom SSL context to ignore all verification
    import ssl
    try:
        mongo_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, tls=True, tlsAllowInvalidCertificates=True, tlsAllowInvalidHostnames=True)
    except:
        # Fallback for older pymongo versions or specific SSL envs
        mongo_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Trigger a server check
    mongo_client.admin.command('ping')
    
    db_name = MONGO_URI.split("/")[-1].split("?")[0] or "uav_detection"
    db = mongo_client[db_name]
    analysis_collection = db["analysis_logs"]
    json_collection = db["json_uploads"] # Collection for JSON uploads
    print(f"Connected to MongoDB: {db_name}")
except Exception as e:
    print(f"Warning: MongoDB connection failed: {e}. Stats will not be saved.")
    mongo_client = None

@app.post("/upload-json")
async def upload_json(file: UploadFile = File(...)):
    if json_collection is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        content = await file.read()
        json_data = json.loads(content.decode("utf-8"))
        
        # Add metadata
        document = {
            "filename": file.filename,
            "upload_timestamp": datetime.utcnow(),
            "data": json_data
        }
        
        result = json_collection.insert_one(document)
        
        return {
            "message": "JSON uploaded successfully",
            "id": str(result.inserted_id),
            "filename": file.filename
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        print(f"Error uploading JSON: {e}")
        raise HTTPException(status_code=500, detail=str(e))

SYSTEM_PROMPT = """You are an expert RF signal analyst specializing in unmanned aerial vehicle (UAV) detection and threat assessment.

## Your Responsibilities:
1. Analyze provided RF signal characteristics
2. Assign an appropriate risk level based on evidence

## Risk Level Classification:
- **MINIMAL**: Clear consumer drone patterns, standard protocols, normal behavior
- **LOW**: Mostly benign with minor anomalies that have innocent explanations
- **MODERATE**: Mixed signals or unusual patterns that warrant monitoring
- **HIGH**: Multiple concerning indicators suggesting potential threat
- **CRITICAL**: Strong evidence of malicious intent or unauthorized operation

## Important Constraints:
- Return ONLY 2 lines of analysis and a risk score.
- Score scale: 0 is completely safe, 1 is confirmed unsafe threat.
- Format:
  Analysis: [One sentence summary]
  Risk Score: [0.0 - 1.0]
"""


if api_key:
    try:
        genai.configure(api_key=api_key)
        genai_model = genai.GenerativeModel(
            model_name=os.getenv("LLM_MODEL", "gemini-2.0-flash"),
            system_instruction=SYSTEM_PROMPT
        )
        print("Gemini Client initialized with system prompt.")
    except Exception as e:
        print(f"Failed to initialize Gemini client: {e}")
else:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

# Load model - Update this path to where you put your model
# MODEL_PATH = "models/best.pt" # This is now handled in lifespan
model = None # Initialized to None, loaded in lifespan

# @app.on_event("startup") # This is now handled by the lifespan context manager
# async def startup_event():
#     global model
#     if os.path.exists(f"backend/{MODEL_PATH}"):
#          # logic if running from root
#          model_file = f"backend/{MODEL_PATH}"
#     elif os.path.exists(MODEL_PATH):
#          # logic if running from backend dir
#          model_file = MODEL_PATH
#     else:
#         print(f"Warning: Model not found at {MODEL_PATH}. Prediction endpoint will return errors.")
#         return

#     try:
#         model = YOLO(model_file)
#         print(f"Model loaded from {model_file}")
#     except Exception as e:
#         print(f"Failed to load model: {e}")

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
class AnalysisRequest(BaseModel):
    data: Dict[str, Any]
    prompt: str = "Analyze the following RF signal data based on the provided framework."
@app.post("/analyze-json")
async def analyze_json(request: AnalysisRequest):
    if genai_model is None:
        raise HTTPException(status_code=503, detail="LLM Client not initialized")

    try:
        response = genai_model.generate_content(
            f"{request.prompt}\n\nData:\n{request.data}"
        )

        # Parse Risk Score
        risk_score = 0.0
        try:
            match = re.search(r"Risk Score:\s*([0-9]*\.?[0-9]+)", response.text)
            if match:
                risk_score = float(match.group(1))
        except Exception as e:
            print(f"Error parsing risk score: {e}")

        response_data = {
            "success": True,
            "status": 200,
            "model": os.getenv("LLM_MODEL", "gemini-2.0-flash"),
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": str(uuid.uuid4()),
            "data": {
                "input": {
                    "prompt": request.prompt,
                    "rf_data": request.data
                },
                "output": {
                    "analysis": response.text,
                    "risk_score": risk_score
                }
            },
            "error": None
        }

        # Save to MongoDB
        if analysis_collection is not None:
            try:
                # Flattens structure slightly for easier querying if needed, or keeps it nested
                # Let's add top-level risk_score for easier querying
                mongo_doc = response_data.copy()
                mongo_doc["risk_score"] = risk_score
                analysis_collection.insert_one(mongo_doc)
                print(f"Saved analysis to MongoDB: {response_data['request_id']} (Risk: {risk_score})")
            except Exception as e:
                print(f"Error saving to MongoDB: {e}")

        return response_data

    except Exception as e:
        return {
            "success": False,
            "status": 500,
            "error": {
                "code": "GEMINI_ANALYSIS_FAILED",
                "message": str(e)
            }
        }

@app.get("/analysis-history")
async def get_analysis_history(limit: int = 50):
    if analysis_collection is None:
        raise HTTPException(status_code=503, detail="MongoDB not connected")
    
    try:
        # Fetch recent logs, sorted by timestamp descending
        cursor = analysis_collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit)
        history = list(cursor)
        return {
            "count": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
         raise HTTPException(status_code=503, detail="Model not loaded. Please ensure 'backend/models/best.pt' exists.")

    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Run inference
        results = model(image)
        
        # Process results
        detections = []
        for result in results:
            for box in result.boxes:
                detections.append({
                    "bbox": box.xyxy[0].tolist(), # [x1, y1, x2, y2]
                    "conf": float(box.conf[0]),
                    "class": int(box.cls[0]),
                    "label": result.names[int(box.cls[0])]
                })
        
        return {"detections": detections}
    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))
