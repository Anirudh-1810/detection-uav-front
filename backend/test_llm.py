import requests
import json

def test_analyze_json():
    url = "http://localhost:8000/analyze-json"
    data = {
        "prompt": "Analyze this RF signal capture.",
        "data": {
          "avg_power_db": -31.8,
          "burst_rate": 15.4,
          "active_ratio": 0.82,
          "bandwidth_mhz": 2.6,
          "spectral_entropy": 0.91,
          "persistence_score": 0.88
        }
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_analyze_json()
