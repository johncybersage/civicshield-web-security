import requests
import sys
import uuid

BASE_URL = "https://civicshield-api.onrender.com/api"

# 1. Register test user
user_data = {
    "email": f"testotp_{uuid.uuid4().hex[:6]}@civicshield.com",
    "password": "Password123!",
    "name": "Test OTP User"
}
res = requests.post(f"{BASE_URL}/auth/register", json=user_data)
if res.status_code != 200:
    print(f"Register failed: {res.text}")
    sys.exit(1)

# 2. Login
login_data = {
    "username": user_data["email"],
    "password": user_data["password"]
}
res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
if res.status_code != 200:
    print(f"Login failed: {res.text}")
    sys.exit(1)
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 3. Request OTP
phone = "+1" + str(uuid.uuid4().int)[:10]
res = requests.post(f"{BASE_URL}/auth/request-otp", json={"phone_number": phone}, headers=headers)
if res.status_code != 200:
    print(f"Request OTP failed: {res.text}")
    sys.exit(1)

# 4. Verify with WRONG OTP (should fail)
res = requests.post(f"{BASE_URL}/auth/verify-otp", json={"phone_number": phone, "otp": "654321"}, headers=headers)
print("Wrong OTP response:", res.status_code, res.text)
if res.status_code != 400:
    print("Wrong OTP didn't fail with 400!")
    sys.exit(1)

# 5. Verify with DEMO OTP
res = requests.post(f"{BASE_URL}/auth/verify-otp", json={"phone_number": phone, "otp": "123456"}, headers=headers)
print("Demo OTP response:", res.status_code, res.text)
if sys.argv[1] == "true" and res.status_code != 200:
    print("Demo OTP failed when mode is enabled!")
    sys.exit(1)
if sys.argv[1] == "false" and res.status_code == 200:
    print("Demo OTP succeeded when mode is disabled!")
    sys.exit(1)

print("Test passed for mode:", sys.argv[1])
