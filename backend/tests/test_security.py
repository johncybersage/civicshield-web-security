from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_xss_defense():
    """
    Test that the Security Lab properly handles XSS payloads.
    The protected output MUST be sanitized (stripped of unsafe tags).
    """
    # Act as a logged in user - mocked token or skip if endpoints are not secured yet
    # We will just test the sanitization logic if the endpoint requires auth, 
    # we need to login first. Let's create a test user and login.
    
    # Actually, we can test the `sanitize_text` directly and the XSS endpoint.
    from app.api.endpoints.complaints import sanitize_text
    
    payload = "<script>alert('XSS')</script>"
    sanitized = sanitize_text(payload)
    
    # Bleach should strip the tags, leaving only "alert('XSS')"
    assert "<script>" not in sanitized
    assert "</script>" not in sanitized
    
    payload_img = '<img src="x" onerror="alert(1)">'
    sanitized_img = sanitize_text(payload_img)
    
    assert "<img" not in sanitized_img
    assert "onerror" not in sanitized_img

def test_security_headers():
    response = client.get("/")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert "1; mode=block" in response.headers.get("X-XSS-Protection")

def test_cors_headers():
    # Test allowed origin (default local config)
    response = client.options("/", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"})
    assert response.status_code == 200

    # Test disallowed origin
    response_bad = client.options("/", headers={"Origin": "https://malicious.com", "Access-Control-Request-Method": "GET"})
    assert response_bad.status_code == 400

def test_rate_limiting():
    # Test that exceeding 5 requests per minute on login triggers 429
    # We will use a unique IP address just for this test
    unique_ip = "192.168.1.100"
    
    # Send 5 requests
    for _ in range(5):
        resp = client.post("/api/auth/login", data={"username": "test@test.com", "password": "abc"}, headers={"X-Forwarded-For": unique_ip})
        # Should be 400 (bad login) but NOT 429
        assert resp.status_code != 429

    # The 6th request should be rate limited
    resp = client.post("/api/auth/login", data={"username": "test@test.com", "password": "abc"}, headers={"X-Forwarded-For": unique_ip})
    assert resp.status_code == 429

def test_secrets_validation():
    from app.core.config import Settings
    from pydantic import ValidationError
    
    # Missing required secrets should raise ValidationError
    try:
        Settings(DATABASE_URL="abc", JWT_SECRET=None, ADMIN_PASSWORD="xyz")
        assert False, "Should have raised ValidationError"
    except ValidationError:
        pass
