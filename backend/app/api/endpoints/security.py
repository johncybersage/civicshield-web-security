from typing import Any
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bleach

from app.core.database import get_db
from app.models.user import User
from app.models.audit import SecurityEvent
from app.api.deps import get_current_user

router = APIRouter()

class XSSTestPayload(BaseModel):
    payload: str

class XSSTestResponse(BaseModel):
    mode: str
    rendered_output: str

@router.post("/xss-lab", response_model=XSSTestResponse)
def xss_lab_test(
    *,
    db: Session = Depends(get_db),
    test_data: XSSTestPayload,
    request: Request,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Security Lab endpoint demonstrating XSS.
    Returns both vulnerable and protected outputs.
    """
    raw_payload = test_data.payload
    
    # 1. Vulnerable Output (No Sanitization, directly reflected)
    # In a real app, this would be what is stored in the DB without sanitization
    # and returned raw to the frontend.
    vulnerable_output = raw_payload
    
    # 2. Protected Output (Sanitized)
    # Using Bleach to strip unsafe tags and attributes before storage/reflection.
    protected_output = bleach.clean(
        raw_payload, 
        tags=[], # Strip all tags for maximum safety in text contexts
        attributes={}, 
        strip=True
    )
    
    # Log the security event
    ip = request.client.host if request else None
    
    # Check if attack was blocked
    was_blocked = vulnerable_output != protected_output
    status = "BLOCKED" if was_blocked else "SAFE_INPUT"
    severity = "HIGH" if "<script>" in raw_payload.lower() or "javascript:" in raw_payload.lower() or "onload=" in raw_payload.lower() or "onerror=" in raw_payload.lower() else "LOW"
    
    event = SecurityEvent(
        event_type="XSS_TEST",
        severity=severity,
        description=f"Status: {status} | Payload: {raw_payload} | Cleaned: {protected_output}",
        user_id=current_user.id,
        source_ip=ip
    )
    db.add(event)
    db.commit()
    
    return {
        "mode": "DUAL_DEMONSTRATION",
        "rendered_output": protected_output, # We can just return the protected, but frontend might need both for demo
        "vulnerable_output": vulnerable_output,
        "protected_output": protected_output
    }
