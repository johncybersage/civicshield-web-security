from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ComplaintComment, Priority
from app.schemas.complaint import (
    ComplaintCreate, ComplaintUpdate, Complaint as ComplaintSchema, 
    ComplaintWithComments, ComplaintCommentCreate, ComplaintComment as ComplaintCommentSchema
)
from app.api.deps import get_current_user, get_current_active_officer
from app.services.ai_service import analyze_complaint
from app.api.endpoints.auth import log_audit
import bleach
from app.core.rate_limit import limiter

router = APIRouter()

# XSS Defense mechanism: Sanitize inputs where we might allow some text, 
# though for strict protection we use output encoding in React.
# As a defense-in-depth, we also bleach incoming data.
def sanitize_text(text: str) -> str:
    # Allow absolutely no HTML tags
    return bleach.clean(text, tags=[], attributes={}, strip=True)

@router.post("/", response_model=ComplaintSchema)
@limiter.limit("10/minute")
def create_complaint(
    *,
    db: Session = Depends(get_db),
    complaint_in: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    request: Request
) -> Any:
    """Create new complaint (Citizen only)."""
    # Sanitize inputs (Defense in Depth)
    safe_title = sanitize_text(complaint_in.title)
    safe_description = sanitize_text(complaint_in.description)
    safe_location = sanitize_text(complaint_in.location) if complaint_in.location else None

    # Call AI Service for classification
    ai_result = analyze_complaint(safe_title, safe_description)
    
    try:
        ai_priority = Priority(ai_result.get("priority", "LOW"))
    except ValueError:
        ai_priority = Priority.LOW

    complaint = Complaint(
        title=safe_title,
        description=safe_description,
        location=safe_location,
        citizen_id=current_user.id,
        ai_category=ai_result.get("category"),
        ai_priority=ai_priority,
        final_priority=ai_priority, # Default to AI priority until officer reviews
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    
    log_audit(db, "COMPLAINT_CREATED", current_user.id, request, f"Complaint ID: {complaint.id}")
    return complaint

@router.get("/", response_model=List[ComplaintSchema])
def read_complaints(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Retrieve complaints. Citizens see only theirs, Officers/Admins see all."""
    if current_user.role == UserRole.CITIZEN:
        complaints = db.query(Complaint).filter(Complaint.citizen_id == current_user.id).offset(skip).limit(limit).all()
    else:
        complaints = db.query(Complaint).offset(skip).limit(limit).all()
    return complaints

@router.get("/{id}", response_model=ComplaintWithComments)
def read_complaint(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get a specific complaint by ID."""
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if current_user.role == UserRole.CITIZEN and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return complaint

@router.patch("/{id}", response_model=ComplaintSchema)
def update_complaint(
    *,
    db: Session = Depends(get_db),
    id: int,
    complaint_in: ComplaintUpdate,
    current_user: User = Depends(get_current_active_officer),
    request: Request
) -> Any:
    """Update a complaint (Officer/Admin only)."""
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    update_data = complaint_in.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] == "RESOLVED":
        complaint.resolved_at = datetime.utcnow()
        
    for field, value in update_data.items():
        setattr(complaint, field, value)
        
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    
    log_audit(db, "COMPLAINT_UPDATED", current_user.id, request, f"Complaint ID: {complaint.id} status changed to {complaint.status}")
    
    return complaint

@router.post("/{id}/comments", response_model=ComplaintCommentSchema)
def create_comment(
    *,
    db: Session = Depends(get_db),
    id: int,
    comment_in: ComplaintCommentCreate,
    current_user: User = Depends(get_current_user),
    request: Request
) -> Any:
    """Add a comment to a complaint."""
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if current_user.role == UserRole.CITIZEN and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    safe_content = sanitize_text(comment_in.content)
    
    comment = ComplaintComment(
        complaint_id=id,
        user_id=current_user.id,
        content=safe_content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    log_audit(db, "COMMENT_ADDED", current_user.id, request, f"Complaint ID: {id}")
    
    return comment
