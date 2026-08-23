from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints_and_csp():
    # 1. GET /
    res = client.get("/")
    assert res.status_code == 200
    print("GET / passed")

    # 2. GET /docs
    res = client.get("/docs")
    assert res.status_code == 200
    assert "cdn.jsdelivr.net" in res.headers.get("Content-Security-Policy")
    print("GET /docs passed, CSP OK")

    # 3. GET /redoc
    res = client.get("/redoc")
    assert res.status_code == 200
    assert "cdn.jsdelivr.net" in res.headers.get("Content-Security-Policy")
    print("GET /redoc passed, CSP OK")

    # 4. GET /openapi.json
    res = client.get("/openapi.json")
    assert res.status_code == 200
    assert "openapi" in res.json()
    print("GET /api/openapi.json passed")

if __name__ == "__main__":
    test_endpoints_and_csp()
