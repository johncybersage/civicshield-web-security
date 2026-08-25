from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ComplaintStatus
from app.schemas.user import User as UserSchema, UserUpdate, UserStats
from app.api.deps import get_current_active_admin, get_current_active_officer, get_current_user

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/officers", response_model=List[UserSchema])
def read_officers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_officer),
) -> Any:
    officers = db.query(User).filter(User.role == UserRole.OFFICER).all()
    return officers

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get current user."""
    return current_user

@router.patch("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update own user."""
    if user_in.name:
        current_user.name = user_in.name
    if user_in.phone_number is not None:
        current_user.phone_number = user_in.phone_number
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/stats", response_model=UserStats)
def read_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get complaint statistics for the current user."""
    complaints = db.query(Complaint).filter(Complaint.citizen_id == current_user.id).all()
    total = len(complaints)
    submitted = sum(1 for c in complaints if c.status in [ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW])
    in_progress = sum(1 for c in complaints if c.status in [ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS])
    resolved = sum(1 for c in complaints if c.status == ComplaintStatus.RESOLVED)
    
    res_rate = 0.0
    if total > 0:
        res_rate = (resolved / total) * 100.0
        
    return {
        "total_complaints": total,
        "submitted": submitted,
        "in_progress": in_progress,
        "resolved": resolved,
        "resolution_rate": res_rate
    }
