import requests

url = "http://localhost:8000/api/auth/login"
data = {
    "username": "demo@civicshield.local",
    "password": "CivicShieldDemo@2026"
}
response = requests.post(url, data=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
