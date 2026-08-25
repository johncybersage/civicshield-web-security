import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_complaint_lifecycle(db_session, test_user_token):
    # 1. Create a complaint
    headers = {"Authorization": f"Bearer {test_user_token}"}
    complaint_data = {
        "title": "Pothole on Main St",
        "description": "Large pothole causing traffic issues.",
        "category": "Roads and potholes",
        "phone_number": "1234567890",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    
    res = client.post("/api/complaints/", json=complaint_data, headers=headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert "tracking_id" in data
    assert data["tracking_id"].startswith("CIV-")
    assert data["phone_number"] == "1234567890"
    
    complaint_id = data["id"]
    tracking_id = data["tracking_id"]
    
    # 2. Get the complaint and check history (Should have SUBMITTED)
    res = client.get(f"/api/complaints/{complaint_id}", headers=headers)
    assert res.status_code == 200
    details = res.json()
    assert "history" in details
    assert len(details["history"]) == 1
    assert details["history"][0]["new_status"] == "SUBMITTED"
    
    # 3. Public tracking
    res = client.get(f"/api/complaints/track/{tracking_id}")
    assert res.status_code == 200
    track_data = res.json()
    assert track_data["tracking_id"] == tracking_id
    assert track_data["title"] == "Pothole on Main St"
    assert "history" in track_data
    assert len(track_data["history"]) == 1
