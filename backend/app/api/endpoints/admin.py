from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.audit import AuditLog, SecurityEvent
from app.schemas.audit import AuditLog as AuditLogSchema, SecurityEvent as SecurityEventSchema
from app.api.deps import get_current_active_admin

router = APIRouter()

@router.get("/audit-logs", response_model=List[AuditLogSchema])
def read_audit_logs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs

@router.get("/security-events", response_model=List[SecurityEventSchema])
def read_security_events(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    events = db.query(SecurityEvent).order_by(SecurityEvent.timestamp.desc()).offset(skip).limit(limit).all()
    return events
