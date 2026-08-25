from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    name: str
    email: str  # Changed from EmailStr to allow .local test domains
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str
    email: EmailStr # Keep strict validation for new user creation

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    role: UserRole
    is_active: bool
    is_phone_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class User(UserInDBBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None
