from datetime import timedelta, datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.audit import AuditLog
from app.models.otp import OTPAttempt
from app.schemas.user import UserCreate, User as UserSchema, Token
from app.schemas.otp import OTPRequest, OTPVerify
from app.security.auth import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user
from app.core.rate_limit import limiter
from app.services.otp_service import generate_otp, hash_otp, send_otp_sms

router = APIRouter()

def log_audit(
    db: Session,
    action: str,
    user_id: int = None,
    request: Request = None,
    metadata_info: str = None
):
    ip = None

    if request:
        ip = (
            request.headers.get("X-Forwarded-For", "")
            .split(",")[0]
            .strip()
            or None
        )

        if not ip and request.client:
            ip = request.client.host

    log = AuditLog(
        user_id=user_id,
        action=action,
        ip_address=ip,
        metadata_info=metadata_info
    )

    db.add(log)
    db.commit()

@router.post("/register", response_model=UserSchema)
@limiter.limit("5/minute")
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
            detail="The user with this email already exists in the system.",
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
@limiter.limit("5/minute")
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

@router.post("/request-otp")
@limiter.limit("3/minute")
def request_otp(
    *,
    db: Session = Depends(get_db),
    otp_request: OTPRequest,
    current_user: User = Depends(get_current_user),
    request: Request
) -> Any:
    """Request an OTP for phone verification."""
    if current_user.is_phone_verified:
        raise HTTPException(status_code=400, detail="Phone number is already verified.")
    
    # Check if this phone number is used by another verified user
    existing_phone_user = db.query(User).filter(User.phone_number == otp_request.phone_number, User.is_phone_verified == True).first()
    if existing_phone_user and existing_phone_user.id != current_user.id:
        raise HTTPException(status_code=400, detail="Phone number is already in use by another verified account.")

    # Phone-number based rate limiting (max 3 requests per minute per phone number)
    recent_attempts = db.query(OTPAttempt).filter(
        OTPAttempt.phone_number == otp_request.phone_number,
        OTPAttempt.created_at >= datetime.utcnow() - timedelta(minutes=1)
    ).count()
    if recent_attempts >= 3:
        raise HTTPException(status_code=429, detail="Too many OTP requests for this phone number. Please wait a minute.")

    # Invalidate previous unexpired OTPs for this user
    db.query(OTPAttempt).filter(OTPAttempt.user_id == current_user.id, OTPAttempt.is_used == False).update({"is_used": True})
    
    otp = generate_otp()
    otp_hash = hash_otp(otp)
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    otp_attempt = OTPAttempt(
        phone_number=otp_request.phone_number,
        otp_hash=otp_hash,
        user_id=current_user.id,
        expires_at=expires_at
    )
    db.add(otp_attempt)
    db.commit()

    # Send OTP
    send_otp_sms(otp_request.phone_number, otp)

    log_audit(db, "OTP_REQUESTED", current_user.id, request)

    return {"message": "OTP sent successfully"}

@router.post("/verify-otp")
@limiter.limit("5/minute")
def verify_otp(
    *,
    db: Session = Depends(get_db),
    otp_verify: OTPVerify,
    current_user: User = Depends(get_current_user),
    request: Request
) -> Any:
    """Verify an OTP."""
    if current_user.is_phone_verified:
        raise HTTPException(status_code=400, detail="Phone number is already verified.")

    otp_attempt = db.query(OTPAttempt).filter(
        OTPAttempt.user_id == current_user.id,
        OTPAttempt.phone_number == otp_verify.phone_number,
        OTPAttempt.is_used == False
    ).order_by(OTPAttempt.created_at.desc()).first()

    if not otp_attempt:
        log_audit(db, "OTP_VERIFY_FAILED", current_user.id, request, "No active OTP found")
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    from datetime import timezone
    if otp_attempt.expires_at.replace(tzinfo=timezone.utc) < datetime.utcnow().replace(tzinfo=timezone.utc):
        log_audit(db, "OTP_VERIFY_FAILED", current_user.id, request, "OTP expired")
        raise HTTPException(status_code=400, detail="OTP has expired")

    otp_attempt.attempts += 1
    
    if otp_attempt.attempts > 3:
        otp_attempt.is_used = True
        db.commit()
        log_audit(db, "OTP_VERIFY_FAILED", current_user.id, request, "Max attempts exceeded")
        raise HTTPException(status_code=400, detail="Maximum OTP attempts exceeded. Please request a new one.")

    is_demo_mode = str(settings.OTP_DEMO_MODE).strip().lower() in ("true", "1", "t", "y", "yes", "on")
    demo_otp_val = str(settings.DEMO_OTP).strip().strip("'\"")
    input_otp_val = str(otp_verify.otp).strip().strip("'\"")

    if is_demo_mode and input_otp_val == demo_otp_val:
        pass # Bypass hash check
    else:
        input_hash = hash_otp(otp_verify.otp)
        if input_hash != otp_attempt.otp_hash:
            db.commit()
            log_audit(db, "OTP_VERIFY_FAILED", current_user.id, request, "Incorrect OTP")
            raise HTTPException(status_code=400, detail="Incorrect OTP")

    # Success
    otp_attempt.is_used = True
    current_user.phone_number = otp_verify.phone_number
    current_user.is_phone_verified = True
    db.commit()

    log_audit(db, "OTP_VERIFY_SUCCESS", current_user.id, request)
    
    return {"message": "Phone number verified successfully"}
