import requests
import time

url = "https://civicshield-api.onrender.com/api/auth/me/debug"
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODc2NTQ5MjUsInN1YiI6IjI0In0.RdRmyZDqGh-JxGxVK1s6PWCKYtWoy9e02lsnah6SKG4"
headers = {"Authorization": f"Bearer {token}"}

while True:
    response = requests.get(url, headers=headers)
    if response.status_code != 404:
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        break
    print("Waiting for deployment...")
    time.sleep(5)
