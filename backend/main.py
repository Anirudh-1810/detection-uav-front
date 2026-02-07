from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
genai_model = None

SYSTEM_PROMPT = """You are an RF analyst for UAV detection.
Analyze RF signal data and assign a risk level.

Return exactly:
- 1 line with Risk Level
- 1 line with Score (0 safe → 1 unsafe)

Acknowledge uncertainty if present.
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

        return {
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
                    "analysis": response.text
                }
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "status": 500,
            "error": {
                "code": "GEMINI_ANALYSIS_FAILED",
                "message": str(e)
            }
        }
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
