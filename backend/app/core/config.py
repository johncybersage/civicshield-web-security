from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional, List

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicShield"
    API_V1_STR: str = "/api"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
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
    
    # Admin
    ADMIN_EMAIL: str = "admin@demo.local"
    ADMIN_PASSWORD: str = Field(..., description="Default admin password")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
