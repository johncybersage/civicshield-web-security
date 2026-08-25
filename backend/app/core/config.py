from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional, List, Any

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicShield"
    API_V1_STR: str = "/api"
    
    FRONTEND_URL: Optional[str] = None
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any, info) -> Any:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
        
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.FRONTEND_URL and self.FRONTEND_URL not in self.BACKEND_CORS_ORIGINS:
            self.BACKEND_CORS_ORIGINS.append(self.FRONTEND_URL)
    
    # Database
    DATABASE_URL: str = Field(..., description="PostgreSQL database URL")

    @field_validator("DATABASE_URL")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if v and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v
    
    # Auth
    JWT_SECRET: str = Field(..., description="Secret key for JWT generation")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # AI (Gemini)
    GEMINI_API_KEY: Optional[str] = None
    
    # Supabase (Storage)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    
    # Twilio (SMS) & OTP
    OTP_PROVIDER: str = "development" # 'development' or 'twilio'
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None
    
    # Demo OTP Mode
    OTP_DEMO_MODE: bool = False
    DEMO_OTP: str = "123456"
    
    # Admin
    ADMIN_EMAIL: str = "admin@demo.local"
    ADMIN_PASSWORD: str = Field(..., description="Default admin password")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
