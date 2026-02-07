from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import io
from PIL import Image
import os

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model - Update this path to where you put your model
MODEL_PATH = "models/best.pt" 

model = None

@app.on_event("startup")
async def startup_event():
    global model
    if os.path.exists(f"backend/{MODEL_PATH}"):
         # logic if running from root
         model_file = f"backend/{MODEL_PATH}"
    elif os.path.exists(MODEL_PATH):
         # logic if running from backend dir
         model_file = MODEL_PATH
    else:
        print(f"Warning: Model not found at {MODEL_PATH}. Prediction endpoint will return errors.")
        return

    try:
        model = YOLO(model_file)
        print(f"Model loaded from {model_file}")
    except Exception as e:
        print(f"Failed to load model: {e}")

@app.get("/")
def read_root():
    return {"message": "UAV Detection API is running"}

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
