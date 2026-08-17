from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicShield"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "postgresql://civicshield_user:civicshield_dev_password@localhost:5432/civicshield_db"
    
    # Auth
    JWT_SECRET: str = "civicshield_super_secret_dev_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # AI (Gemini)
    GEMINI_API_KEY: Optional[str] = None
    
    # Admin
    ADMIN_EMAIL: str = "admin@demo.local"
    ADMIN_PASSWORD: str = "admin_password"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
