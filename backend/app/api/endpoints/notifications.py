from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationSchema
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[NotificationSchema])
def get_notifications(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get current user's notifications."""
    notifications = db.query(Notification).filter(
        Notification.recipient_id == current_user.id
    ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications

@router.patch("/{id}/read", response_model=NotificationSchema)
def mark_read(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Mark a notification as read."""
    notification = db.query(Notification).filter(Notification.id == id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.recipient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    notification.is_read = True
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.post("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Mark all notifications as read for current user."""
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"success": True}
