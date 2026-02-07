import cv2
import numpy as np
from ultralytics import YOLO
## from .tracker import Tracker # Will be implemented next

class Detector:
    def __init__(self, model_path='yolov8s.pt'):
        self.model = YOLO(model_path)
    
    def process_frame(self, frame):
        """
        Run inference on a frame.
        Returns:
            results: ultralytics results object
            detections: list of [x1, y1, x2, y2, conf, class_id]
        """
        results = self.model.track(frame, persist=True, verbose=False)
        return results[0]
