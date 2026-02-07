import requests
import numpy as np
import cv2
import io

def test_predict():
    # Create a dummy image (black square)
    img = np.zeros((640, 640, 3), dtype=np.uint8)
    _, img_encoded = cv2.imencode('.jpg', img)
    files = {'file': ('test.jpg', io.BytesIO(img_encoded.tobytes()), 'image/jpeg')}

    try:
        response = requests.post('http://localhost:8000/predict', files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200 and "detections" in response.json():
            print("SUCCESS: /predict returned detections structure.")
        else:
            print("FAILURE: /predict did not return expected structure.")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_predict()
