from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "civicshield-backend"}

def test_idor_protection_without_auth():
    # Attempt to update a complaint without auth should fail
    response = client.patch("/api/complaints/1", json={"status": "IN_PROGRESS"})
    assert response.status_code == 401
    
def test_rate_limit_otp():
    import uuid
    # Register and login user
    unique_email = f"otp_{uuid.uuid4()}@test.com"
    client.post("/api/auth/register", json={"name": "Citizen", "email": unique_email, "password": "citizen_password"})
    res = client.post("/api/auth/login", data={"username": unique_email, "password": "citizen_password"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Attempt to hit OTP request multiple times to trigger rate limit
    for _ in range(5):
        client.post("/api/auth/request-otp", json={"phone_number": "+1234567890"}, headers=headers)

    # 6th should fail (limit is 3/min)
    response = client.post("/api/auth/request-otp", json={"phone_number": "+1234567890"}, headers=headers)
    assert response.status_code == 429
