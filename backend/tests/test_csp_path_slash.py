from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_docs_slash():
    res = client.get("/docs/")
    print("GET /docs/ path in CSP:", res.headers.get("Content-Security-Policy"))

if __name__ == "__main__":
    test_docs_slash()
