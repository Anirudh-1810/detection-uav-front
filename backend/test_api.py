from fastapi.testclient import TestClient
from main import app
import os
import sys

# Add backend directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def test_read_root():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "UAV Detection & Tracking API is running"}
        print("Root endpoint test passed!")

if __name__ == "__main__":
    try:
        test_read_root()
        print("Backend basic verification successful.")
    except Exception as e:
        print(f"Backend verification failed: {e}")
