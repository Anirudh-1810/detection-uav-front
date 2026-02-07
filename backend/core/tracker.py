import numpy as np
from collections import deque

class Tracker:
    def __init__(self):
        self.tracks = {} # ID -> Track History

    def update(self, detections, frame_id):
        # YOLOv8 handles tracking internally with .track()
        # This class will mainly manage track history/paths for visualization
        
        # Detections structure from YOLO result.boxes
        # If using .track(), results already have .id
        pass

    def update_tracks(self, results):
        """
        Update local track history from YOLO results
        """
        current_ids = []
        if results.boxes.id is not None:
             track_ids = results.boxes.id.int().cpu().tolist()
             boxes = results.boxes.xywh.cpu() # xywh for center point calculation

             for track_id, box in zip(track_ids, boxes):
                 x, y, w, h = box
                 center = (float(x), float(y))
                 
                 if track_id not in self.tracks:
                     self.tracks[track_id] = deque(maxlen=30) # Keep last 30 points
                 
                 self.tracks[track_id].append(center)
                 current_ids.append(track_id)
        
        return self.tracks
