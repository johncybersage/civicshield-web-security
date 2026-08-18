import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

# Use an in-memory SQLite database for testing, or a specific test DB.
# For simplicity, we'll just test against the existing DB since it's a dev environment,
# or we can mock it. Since the DB is already seeded and running, we can just use the client.

client = TestClient(app)

def test_health():
    response = client.get("/docs")
    assert response.status_code == 200
    response = client.get("/redoc")
    assert response.status_code == 200
    response = client.get("/openapi.json")
    assert response.status_code == 200

def test_auth_and_rbac():
    # 1. Register a new user
    unique_email = f"test_{uuid.uuid4()}@test.com"
    res = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": unique_email,
        "password": "testpassword123"
    }, headers={"X-Forwarded-For": "10.0.0.1"})
    assert res.status_code == 200, res.text
    
    # 2. Login
    res = client.post("/api/auth/login", data={
        "username": unique_email,
        "password": "testpassword123"
    }, headers={"X-Forwarded-For": "10.0.0.1"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Create complaint
    res = client.post("/api/complaints/", json={
        "title": "Test Complaint",
        "description": "This is a test complaint with safe text",
        "location": "Test Location"
    }, headers=headers)
    assert res.status_code == 200
    complaint_id = res.json()["id"]
    
    # 4. View own complaints
    res = client.get("/api/complaints/", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1
    
    # 5. Citizen cannot patch complaint
    res = client.patch(f"/api/complaints/{complaint_id}", json={
        "status": "RESOLVED"
    }, headers=headers)
    assert res.status_code == 403 # Citizen shouldn't have access to update status
    
    # 6. Citizen cannot access admin
    res = client.get("/api/admin/audit-logs", headers=headers)
    assert res.status_code == 403

def test_xss_protection_api():
    # Login as seeded citizen
    res = client.post("/api/auth/login", data={
        "username": "citizen@demo.local",
        "password": "citizen_password"
    }, headers={"X-Forwarded-For": "10.0.0.2"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Send XSS payload
    payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>"
    ]
    
    for payload in payloads:
        res = client.post("/api/complaints/", json={
            "title": f"XSS Test {uuid.uuid4()}",
            "description": payload,
            "location": "Test"
        }, headers=headers)
        assert res.status_code == 200
        data = res.json()
        desc = data["description"]
        # Ensure scripts and dangerous tags are stripped
        assert "<script>" not in desc
        assert "onerror" not in desc
        assert "onload" not in desc

def test_missing_auth():
    res = client.get("/api/complaints/")
    assert res.status_code == 401
