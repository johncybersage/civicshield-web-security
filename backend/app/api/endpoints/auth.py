from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.audit import AuditLog
from app.schemas.user import UserCreate, User as UserSchema, Token
from app.security.auth import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user

router = APIRouter()

def log_audit(db: Session, action: str, user_id: int = None, request: Request = None, metadata_info: str = None):
    ip = request.client.host if request else None
    log = AuditLog(user_id=user_id, action=action, ip_address=ip, metadata_info=metadata_info)
    db.add(log)
    db.commit()

@router.post("/register", response_model=UserSchema)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    request: Request
) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = User(
        email=user_in.email,
        name=user_in.name,
        password_hash=get_password_hash(user_in.password),
        role=UserRole.CITIZEN
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    log_audit(db, "USER_REGISTERED", user.id, request)
    
    return user

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None
) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        log_audit(db, "LOGIN_FAILED", None, request, f"Attempted email: {form_data.username}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    log_audit(db, "LOGIN_SUCCESS", user.id, request)
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserSchema)
def read_users_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    return current_user
