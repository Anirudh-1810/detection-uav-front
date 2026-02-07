import requests
import json

def test_history_api():
    url = "http://localhost:8000/analysis-history"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"History Count: {data['count']}")
            if data['count'] > 0:
                latest = data['history'][0]
                print("Latest Entry:")
                print(f"  Timestamp: {latest.get('timestamp')}")
                print(f"  Risk Score: {latest.get('risk_score')}")
                print(f"  Analysis: {latest['data']['output']['analysis'][:100]}...")
            else:
                print("No history found.")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_history_api()
