import time
import requests
import json
import os
import concurrent.futures

BASE_URL = "http://localhost:8001/api/analytics"

def test_leaderboard():
    start = time.time()
    res = requests.get(f"{BASE_URL}/leaderboard")
    duration = time.time() - start
    return duration, res.status_code, res.json()

def test_dashboard(channel_id):
    start = time.time()
    res = requests.get(f"{BASE_URL}/{channel_id}/dashboard")
    duration = time.time() - start
    return duration, res.status_code

def run_performance_test():
    print("--- Starting Performance Verification ---")
    
    # 1. Get a channel ID
    try:
        with open(os.path.join(os.path.dirname(__file__), "channels.json"), "r") as f:
            data = json.load(f)
            channel_id = data[0] if isinstance(data, list) else list(data.keys())[0]
    except Exception as e:
        print("Could not load channels.json:", e)
        channel_id = "UCX6OQ3DkcsbYNE6H8uQQuVA"
        
    print("\n1. Fetching Leaderboard (First Request)")
    dur, status, data = test_leaderboard()
    print(f"Time taken: {dur:.4f} seconds [Status: {status}]")
    
    if data and data.get("data") and len(data["data"]) > 0:
        # Use first channel from leaderboard that actually exists in DB
        db_channel_name = data["data"][0].get("name")
        print(f"Found Channel in DB: {db_channel_name}")
        # Need actual channel_id, but leaderboard only returns name/thumb/value. 
        # Actually it's better to bypass this and just query /channels/recent
        res = requests.get(f"{BASE_URL}/../channels/recent")
        if res.status_code == 200 and res.json().get("data"):
            channel_id = res.json()["data"][0]["channel_id"]
            
    print(f"Using Channel ID for testing: {channel_id}")
    
    print("\n2. Fetching Leaderboard (Second Request - Cached)")
    dur, status, _ = test_leaderboard()
    print(f"Time taken: {dur:.4f} seconds (Should be near 0) [Status: {status}]")

    # 3. Test Dashboard Load Time
    print(f"\n3. Fetching Dashboard for {channel_id} (Uncached)")
    dur, status = test_dashboard(channel_id)
    print(f"Time taken: {dur:.4f} seconds [Status: {status}]")
    
    print(f"\n4. Fetching Dashboard for {channel_id} (Cached)")
    dur, status = test_dashboard(channel_id)
    print(f"Time taken: {dur:.4f} seconds (Should be near 0) [Status: {status}]")
    
    # 4. Concurrent Load Test
    print("\n5. Simulating 50 concurrent users accessing the Dashboard...")
    start_time = time.time()
    
    def fetch_dash():
        return test_dashboard(channel_id)
        
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(fetch_dash) for _ in range(50)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
    total_time = time.time() - start_time
    avg_req_time = sum(r[0] for r in results) / len(results)
    
    print(f"Total time for 50 concurrent requests: {total_time:.4f} seconds")
    print(f"Average request time: {avg_req_time:.4f} seconds")
    success_count = sum(1 for r in results if r[1] == 200)
    print(f"Successful requests: {success_count}/50")
    print("\n--- Performance Verification Completed ---")

if __name__ == "__main__":
    time.sleep(1) # Give server time to start if run concurrently
    run_performance_test()
