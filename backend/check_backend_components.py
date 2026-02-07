import cv2
from ultralytics import YOLO
import os

def check_components():
    print("--- Component Check ---")
    
    # 1. Check Model
    model_path = "best.pt"
    if os.path.exists(model_path):
        print(f"Found model: {model_path}")
        try:
            model = YOLO(model_path)
            print("Successfully loaded YOLO model.")
            # Test inference
            print("Running dummy inference...")
            model("uploads/2a0e3c36-259c-43c3-840e-dcc224c44b32_WhatsApp Video 2026-02-07 at 19.51.36.mp4", imgsz=640, verbose=False) # Run on video
            print("Inference successful.")
        except Exception as e:
            print(f"Error loading/running model: {e}")
    else:
        print(f"Model file not found: {model_path}")

    # 2. Check Video
    video_path = "uploads/2a0e3c36-259c-43c3-840e-dcc224c44b32_WhatsApp Video 2026-02-07 at 19.51.36.mp4"
    if os.path.exists(video_path):
        print(f"Found video: {video_path}")
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                print("Error: Could not open video capture.")
            else:
                ret, frame = cap.read()
                if ret:
                    print(f"Successfully read frame. Shape: {frame.shape}")
                else:
                    print("Error: Could not read first frame.")
            cap.release()
        except Exception as e:
            print(f"Error opening video: {e}")
    else:
        print(f"Video file not found: {video_path}")

if __name__ == "__main__":
    check_components()
