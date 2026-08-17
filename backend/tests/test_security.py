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
