import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/uav_detection")

try:
    client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db_name = MONGO_URI.split("/")[-1].split("?")[0] or "uav_detection"
    db = client[db_name]
    collection = db["analysis_logs"]
    
    # Get the most recent document
    latest_doc = collection.find_one(sort=[('_id', pymongo.DESCENDING)])
    
    if latest_doc:
        print("Latest MongoDB Entry:")
        print(f"ID: {latest_doc.get('_id')}")
        print(f"Request ID: {latest_doc.get('request_id')}")
        print(f"Timestamp: {latest_doc.get('timestamp')}")
        print(f"Success: {latest_doc.get('success')}")
    else:
        print("No documents found in 'analysis_logs' collection.")

except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
