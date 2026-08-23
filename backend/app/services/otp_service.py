import random
import string
import hashlib
from datetime import datetime, timedelta
from app.core.config import settings

def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of specified length."""
    return ''.join(random.choices(string.digits, k=length))

def hash_otp(otp: str) -> str:
    """Hash the OTP securely for storage. We can use SHA-256 for this temporary short-lived code."""
    # Note: For passwords we use argon2 or bcrypt, but for short-lived numeric OTPs 
    # SHA-256 is generally sufficient if the secret space is small and time-bound.
    # To prevent rainbow tables, we should salt it, but given they expire in minutes,
    # a basic hash with a secret salt is acceptable.
    salted_otp = f"{settings.JWT_SECRET}{otp}"
    return hashlib.sha256(salted_otp.encode()).hexdigest()

def send_otp_sms(phone_number: str, otp: str):
    """
    Send SMS OTP using Twilio, fallback to mock if credentials are not configured.
    """
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER:
        try:
            from twilio.rest import Client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=f"Your CivicShield verification code is: {otp}. It expires in 10 minutes.",
                from_=settings.TWILIO_FROM_NUMBER,
                to=phone_number
            )
            print(f"Twilio SMS sent with SID: {message.sid}")
            return
        except Exception as e:
            print(f"Twilio Error: {e}. Falling back to mock SMS.")

    # DEVELOPMENT MOCK
    print(f"==================================================")
    print(f"MOCK SMS PROVIDER")
    print(f"To: {phone_number}")
    print(f"Message: Your CivicShield verification code is: {otp}. It expires in 10 minutes.")
    print(f"==================================================")
