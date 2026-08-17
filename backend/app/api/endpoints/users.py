from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import User as UserSchema
from app.api.deps import get_current_active_admin, get_current_active_officer

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
