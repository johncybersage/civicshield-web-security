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
    if settings.OTP_PROVIDER == "development":
        print(f"[DEV OTP] Phone: {phone_number} | OTP: {otp}")
        return

    if settings.OTP_PROVIDER == "twilio":
        if not (settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER):
            from fastapi import HTTPException
            raise HTTPException(status_code=500, detail="Twilio credentials must be configured for OTP_PROVIDER=twilio")
        
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
            print(f"Twilio Error: {e}")
            from fastapi import HTTPException
            raise HTTPException(status_code=500, detail="Failed to send SMS via Twilio.")
            
    from fastapi import HTTPException
    raise HTTPException(status_code=500, detail=f"Invalid OTP_PROVIDER: {settings.OTP_PROVIDER}")
