import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
from PIL import Image
import io
import os
import shutil
import cv2
import time
import numpy as np

app = FastAPI(title="YOLO Inference Service")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# Mount separate static directories
app.mount("/videos", StaticFiles(directory="outputs"), name="videos")

# Global model variable
model = None

# Model path - robustly finding it
MODEL_REL_PATH = "../backend/models/best.pt"
MODEL_ABS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), MODEL_REL_PATH))

@app.on_event("startup")
async def startup_event():
    global model
    print(f"Loading YOLO model from: {MODEL_ABS_PATH}")
    if not os.path.exists(MODEL_ABS_PATH):
        print(f"CRITICAL ERROR: Model not found at {MODEL_ABS_PATH}")
        return
    
    try:
        model = YOLO(MODEL_ABS_PATH)
        print("YOLO model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.get("/")
def read_root():
    return {"status": "YOLO Service Running"}

@app.get("/stats")
def get_stats():
    # Mock stats similar to old backend
    return {
        "total_detections": 124,
        "current_occupancy": 2,
        "hourly_breakdown": [5, 12, 8, 15, 20, 10, 5, 2, 0, 0, 0, 0],
        "total_alerts": 15,
        "high_alerts": 3,
        "medium_alerts": 5,
        "low_alerts": 7,
        "recent_alerts": []
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        width, height = image.size

        results = model(image)
        
        detections = []
        for result in results:
            for box in result.boxes:
                bbox = box.xyxy[0].tolist() 
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                cls_name = result.names[cls_id]

                detections.append({
                    "class": cls_name,
                    "confidence": round(conf, 2),
                    "bbox": [round(x, 2) for x in bbox]
                })

        return {
            "success": True,
            "image_size": [width, height],
            "detections": detections
        }

    except Exception as e:
        print(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Save Upload
    temp_filename = f"temp_{int(time.time())}_{file.filename}"
    temp_path = os.path.join("uploads", temp_filename)
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    print(f"Processing video: {temp_path}")
    
    try:
        cap = cv2.VideoCapture(temp_path)
        if not cap.isOpened():
             os.remove(temp_path)
             raise HTTPException(status_code=400, detail="Could not open video file")

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        # Output setup
        output_filename = f"processed_{int(time.time())}.mp4"
        output_path = os.path.join("outputs", output_filename)
        
        # mp4v or avc1
        fourcc = cv2.VideoWriter_fourcc(*'mp4v') 
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Inference
            results = model(frame)
            
            # Annotate
            annotated_frame = results[0].plot()
            out.write(annotated_frame)
            
            frame_count += 1
            if frame_count % 30 == 0:
                print(f"Processed {frame_count} frames")
        
        cap.release()
        out.release()
        os.remove(temp_path) # Cleanup input
        
        print(f"Video processed to {output_path}")
        
        return {
            "message": "Video analysis complete.",
            "job_id": str(int(time.time())), 
            "output_video_path": output_filename,
            "stats": {}
        }

    except Exception as e:
        print(f"Video processing error: {e}")
        try:
            if os.path.exists(temp_path): os.remove(temp_path)
        except: pass
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
