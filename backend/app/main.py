from fastapi import FastAPI
from fastapi.openapi.docs import get_redoc_html
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.rate_limit import limiter
from app.api.api import api_router
from app.core.database import Base, engine

# Ensure database tables are managed by Alembic in production
# Base.metadata.create_all(bind=engine) # Removed to avoid conflicts with Alembic

from contextlib import asynccontextmanager
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.security.auth import get_password_hash, verify_password
import logging

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed demo account securely on startup
    db = SessionLocal()
    try:
        demo_email = "demo@civicshield.local"
        demo_password_plain = "CivicShieldDemo@2026"
        existing_demo = db.query(User).filter(User.email == demo_email).first()
        
        if not existing_demo:
            demo_user = User(
                email=demo_email,
                name="Demo User",
                password_hash=get_password_hash(demo_password_plain),
                role=UserRole.CITIZEN,
                is_phone_verified=True,
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            logging.info("Demo account ready.")
        else:
            # Idempotent robust check
            needs_commit = False
            
            if not existing_demo.is_active or not existing_demo.is_phone_verified:
                existing_demo.is_active = True
                existing_demo.is_phone_verified = True
                needs_commit = True
                
            # Only rehash if the password doesn't match
            if not verify_password(demo_password_plain, existing_demo.password_hash):
                existing_demo.password_hash = get_password_hash(demo_password_plain)
                needs_commit = True
                
            if needs_commit:
                db.commit()
                
            logging.info("Demo account ready.")
    except Exception as e:
        db.rollback()
        logging.error("Error seeding demo account.")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/openapi.json",
    redoc_url=None,
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from fastapi.responses import JSONResponse
import logging

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )



# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Apply relaxed CSP for API documentation endpoints to allow Swagger UI / ReDoc to load CDN resources
        path = request.url.path
        if path.startswith("/docs") or path.startswith("/redoc") or path.startswith("/openapi.json"):
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: https://fastapi.tiangolo.com https://cdn.redoc.ly; "
                "worker-src 'self' blob:;"
            )
        else:
            response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
            
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)

@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url="/openapi.json",
        title=f"{settings.PROJECT_NAME} - ReDoc",
        redoc_js_url="https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js",
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to CivicShield API"}

@app.get("/health", tags=["system"])
def health_check():
    """Liveness probe"""
    return {"status": "ok", "service": "civicshield-backend"}

from sqlalchemy.exc import OperationalError
from sqlalchemy import text
@app.get("/ready", tags=["system"])
def readiness_check():
    """Readiness probe"""
    try:
        # Check database connectivity
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "detail": "Database connection failed"}
        )
