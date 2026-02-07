import urllib.request
import urllib.error
import time
import subprocess
import signal
import os
import json
import sys

def verify_backend():
    print("Starting backend for verification...")
    # Start backend
    # We assume python3 is available and has uvicorn installed or we try to run uvicorn directly
    # If this fails, we might need to install dependencies first.
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--port", "8000"],
        cwd="backend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    try:
        # Wait for valid startup
        print("Waiting for backend to start...")
        started = False
        for i in range(30):
            try:
                with urllib.request.urlopen("http://localhost:8000/") as response:
                    if response.getcode() == 200:
                        print("✓ Backend Root Endpoint Accessible")
                        started = True
                        break
            except urllib.error.URLError:
                time.sleep(1)
            except Exception as e:
                print(f"Connection error: {e}")
                time.sleep(1)
        
        if not started:
             print("❌ Backend failed to start within 30s")
             # Print stderr
             out, err = proc.communicate(timeout=1)
             print(f"Output: {out.decode()}")
             print(f"Error: {err.decode()}")
             return

        # Check stats
        try:
            with urllib.request.urlopen("http://localhost:8000/stats") as response:
                if response.getcode() == 200:
                    data = json.loads(response.read().decode())
                    print("✓ Stats Endpoint Accessible")
                    print(f"  Data: {data}")
                else:
                     print(f"❌ Stats Endpoint Returned {response.getcode()}")
        except Exception as e:
            print(f"❌ Stats Endpoint Failed: {e}")

        # Check video feed (head functionality simulated by reading a bit)
        try:
            # MJPEG stream never ends, so we just open and read a chunk
            with urllib.request.urlopen("http://localhost:8000/video_feed") as response:
                 if response.getcode() == 200:
                     print("✓ Video Feed Endpoint Accessible")
                     ct = response.headers.get('Content-Type')
                     print(f"  Content-Type: {ct}")
                     # Read a small chunk to ensure it's streaming
                     chunk = response.read(1024)
                     if len(chunk) > 0:
                         print(f"✓ Received {len(chunk)} bytes from stream")
                 else:
                     print(f"❌ Video Feed Endpoint Returned {response.getcode()}")
        except Exception as e:
            print(f"❌ Video Feed Failed: {e}")

    finally:
        print("Stopping backend...")
        os.kill(proc.pid, signal.SIGTERM)
        proc.wait()
        print("Backend stopped.")

if __name__ == "__main__":
    verify_backend()
