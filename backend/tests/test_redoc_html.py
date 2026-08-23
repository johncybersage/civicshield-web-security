from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

res = client.get("/redoc")
html = res.read().decode('utf-8')
print(html)
