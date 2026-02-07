import sys
import os
import cv2
import numpy as np

# Add backend to path so imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

try:
    from backend.src.detection.detector_with_tracking import DroneDetectorTracker
except ImportError:
    # Try importing from src directly if running from backend dir
    try:
        from src.detection.detector_with_tracking import DroneDetectorTracker
    except ImportError:
        print("Could not import DroneDetectorTracker. Please ensure you are running this script from the correct directory.")
        sys.exit(1)

def debug_video(video_path):
    print(f"DEBUGGING VIDEO: {video_path}")
    
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        return

    # Initialize model
    try:
        model_path = os.path.join(backend_dir, "best.pt")
        # Ensure we use absolute path
        model_path = os.path.abspath(model_path)
            
        print(f"Loading model from: {model_path}")
        detector = DroneDetectorTracker(model_path=model_path, conf_threshold=0.1) 
        print("Model loaded successfully.")
        
        # Print model classes
        if hasattr(detector.detector.model, 'names'):
             print(f"Model Classes: {detector.detector.model.names}")
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: Could not open video file.")
        return

    frame_count = 0
    total_detections = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        
        if frame_count == 1:
            print(f"Frame Shape: {frame.shape}")

        # Run raw detection first to bypass tracker for debug
        raw_detections = detector.detector.detect(frame)
        
        # Run full pipeline
        tracks, _, alerts = detector.process_frame(frame)
        
        if len(raw_detections) > 0 or len(tracks) > 0:
            print(f"Frame {frame_count}: Raw Detections={len(raw_detections)}, Tracks={len(tracks)}")
            if len(raw_detections) > 0:
                print(f"  Raw: {raw_detections}")
            if len(tracks) > 0:
                print(f"  Tracks: {tracks}")
            total_detections += len(tracks)
        
        if frame_count % 30 == 0:
            print(f"Processed {frame_count} frames...")
            
        if frame_count > 300: # detailed check for first 300 frames
            break

    cap.release()
    print(f"Finished debugging. Total tracks found: {total_detections}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        video_path = sys.argv[1]
    else:
        # Default to one of the uploads
        video_path = "backend/uploads/istockphoto-611228576-640_adpp_is.mp4" # Likely drone video
    
    debug_video(video_path)
