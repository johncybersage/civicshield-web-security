from pydantic import BaseModel, field_validator
import re

def _normalize_phone(v: str) -> str:
    if not v:
        return v
    # Keep leading + if present, strip all other non-digits
    return "+" + re.sub(r"[^\d]", "", v) if v.startswith("+") else re.sub(r"[^\d]", "", v)

class OTPRequest(BaseModel):
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        return _normalize_phone(v)

class OTPVerify(BaseModel):
    phone_number: str
    otp: str

    @field_validator("phone_number")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        return _normalize_phone(v)
