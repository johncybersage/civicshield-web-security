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

from pydantic import BaseModel

class DuplicateCheckRequest(BaseModel):
    title: str
    category: str
    latitude: float
    longitude: float

@router.post("/check-duplicate")
@limiter.limit("10/minute")
def check_duplicate(
    *,
    db: Session = Depends(get_db),
    req: DuplicateCheckRequest,
    current_user: User = Depends(get_current_user),
    request: Request
) -> Any:
    """Check for potential duplicates based on category and basic proximity."""
    # A simple geospatial bounding box query for MVP duplicate detection.
    # ~0.005 degrees is roughly 500 meters.
    lat_diff = 0.005
    lon_diff = 0.005

    duplicates = db.query(Complaint).filter(
        Complaint.category == req.category,
        Complaint.latitude >= req.latitude - lat_diff,
        Complaint.latitude <= req.latitude + lat_diff,
        Complaint.longitude >= req.longitude - lon_diff,
        Complaint.longitude <= req.longitude + lon_diff,
        Complaint.status != "RESOLVED"
    ).limit(5).all()

    return {"duplicates": duplicates}

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

    from app.models.complaint import ComplaintHistory
    import uuid
    from datetime import datetime

    # Generate tracking ID: CIV-YYYYMMDD-<short-uuid>
    date_prefix = datetime.utcnow().strftime("%Y%m%d")
    short_uuid = str(uuid.uuid4())[:6].upper()
    tracking_id = f"CIV-{date_prefix}-{short_uuid}"

    complaint = Complaint(
        tracking_id=tracking_id,
        title=safe_title,
        description=safe_description,
        phone_number=sanitize_text(complaint_in.phone_number) if complaint_in.phone_number else None,
        location=safe_location,
        latitude=complaint_in.latitude,
        longitude=complaint_in.longitude,
        location_accuracy=complaint_in.location_accuracy,
        location_source=complaint_in.location_source,
        human_readable_address=sanitize_text(complaint_in.human_readable_address) if complaint_in.human_readable_address else None,
        category=sanitize_text(complaint_in.category) if complaint_in.category else None,
        citizen_id=current_user.id,
        ai_category=ai_result.get("category"),
        ai_priority=ai_priority,
        final_priority=ai_priority, # Default to AI priority until officer reviews
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    
    # Create initial history entry
    history = ComplaintHistory(
        complaint_id=complaint.id,
        new_status=complaint.status,
        note="Complaint submitted by citizen.",
        updated_by_user_id=current_user.id
    )
    db.add(history)
    db.commit()
    
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

from app.schemas.complaint import ComplaintWithHistory, PublicComplaintTrackingSchema

@router.get("/track/{tracking_id}", response_model=PublicComplaintTrackingSchema)
@limiter.limit("20/minute")
def track_complaint(
    *,
    db: Session = Depends(get_db),
    tracking_id: str,
    request: Request
) -> Any:
    """Publicly track a complaint."""
    complaint = db.query(Complaint).filter(Complaint.tracking_id == tracking_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    return complaint

@router.get("/{id_or_tracking_id}", response_model=ComplaintWithHistory)
def read_complaint(
    *,
    db: Session = Depends(get_db),
    id_or_tracking_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get a specific complaint by ID or tracking_id."""
    if id_or_tracking_id.isdigit():
        complaint = db.query(Complaint).filter(Complaint.id == int(id_or_tracking_id)).first()
    else:
        complaint = db.query(Complaint).filter(Complaint.tracking_id == id_or_tracking_id).first()
        
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

    if current_user.role == UserRole.OFFICER and complaint.assigned_officer_id is not None and complaint.assigned_officer_id != current_user.id:
        # Officer can only update if it's unassigned or assigned to them
        raise HTTPException(status_code=403, detail="You are not authorized to update this complaint.")

    update_data = complaint_in.model_dump(exclude_unset=True)
    status_changed = False
    old_status = complaint.status
    new_status = complaint.status

    if "status" in update_data:
        new_status = update_data["status"]
        if new_status != complaint.status:
            if complaint.status in ["RESOLVED", "REJECTED"]:
                raise HTTPException(status_code=400, detail=f"Cannot change status of a {complaint.status} complaint.")
            
            # Simple state machine enforcement
            allowed_transitions = {
                "SUBMITTED": ["UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "REJECTED"],
                "UNDER_REVIEW": ["ASSIGNED", "IN_PROGRESS", "REJECTED"],
                "ASSIGNED": ["IN_PROGRESS", "REJECTED", "RESOLVED"],
                "IN_PROGRESS": ["RESOLVED", "REJECTED"]
            }
            
            if new_status not in allowed_transitions.get(complaint.status, []):
                raise HTTPException(status_code=400, detail=f"Invalid status transition from {complaint.status} to {new_status}.")

            if new_status == "RESOLVED":
                complaint.resolved_at = datetime.utcnow()
                
            status_changed = True
        
    for field, value in update_data.items():
        if field != "note":
            setattr(complaint, field, value)
            
    db.add(complaint)
    
    if status_changed:
        from app.models.complaint import ComplaintHistory
        history = ComplaintHistory(
            complaint_id=complaint.id,
            old_status=old_status,
            new_status=new_status,
            note=update_data.get("note", f"Status updated to {new_status}."),
            updated_by_user_id=current_user.id
        )
        db.add(history)
        
    db.commit()
    db.refresh(complaint)
    
    if status_changed:
        log_audit(db, "COMPLAINT_UPDATED", current_user.id, request, f"Complaint ID: {complaint.id} status changed to {complaint.status}")
    else:
        log_audit(db, "COMPLAINT_UPDATED", current_user.id, request, f"Complaint ID: {complaint.id} updated")
    
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
