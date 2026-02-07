import cv2
import numpy as np

class ZoneManager:
    def __init__(self):
        self.zones = [] # List of polygons
    
    def add_zone(self, points):
        """
        points: list of [x, y]
        """
        self.zones.append(np.array(points, np.int32))

    def check_intrusion(self, point):
        """
        Check if a point (x, y) is inside any zone.
        Returns zone_index or -1
        """
        for i, zone in enumerate(self.zones):
            # pointPolygonTest returns > 0 if inside, 0 if on edge, < 0 if outside
            if cv2.pointPolygonTest(zone, point, False) >= 0:
                return i
        return -1
