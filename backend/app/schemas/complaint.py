from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.complaint import Priority, ComplaintStatus, LocationSource

class ComplaintCommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class ComplaintCommentCreate(ComplaintCommentBase):
    pass

class ComplaintComment(ComplaintCommentBase):
    id: int
    complaint_id: int
    user_id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}

class ComplaintBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=5000)
    phone_number: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    location_accuracy: Optional[float] = None
    location_source: Optional[LocationSource] = None
    human_readable_address: Optional[str] = None
    category: Optional[str] = None

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    final_priority: Optional[Priority] = None
    category: Optional[str] = None
    assigned_officer_id: Optional[int] = None
    note: Optional[str] = None # Added for officer status update notes

class ComplaintEvidenceSchema(BaseModel):
    id: int
    complaint_id: int
    file_path: str
    file_name: str
    file_type: str
    uploaded_at: datetime
    
    model_config = {"from_attributes": True}

class Complaint(ComplaintBase):
    id: int
    tracking_id: Optional[str] = None
    category: Optional[str] = None
    ai_category: Optional[str] = None
    ai_priority: Optional[Priority] = None
    final_priority: Priority
    status: ComplaintStatus
    citizen_id: int
    assigned_officer_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    evidence: List[ComplaintEvidenceSchema] = []

    model_config = {"from_attributes": True}

class ComplaintWithComments(Complaint):
    comments: List[ComplaintComment] = []

class ComplaintHistorySchema(BaseModel):
    id: int
    complaint_id: int
    old_status: Optional[ComplaintStatus]
    new_status: ComplaintStatus
    note: Optional[str]
    updated_by_user_id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}

class ComplaintWithHistory(ComplaintWithComments):
    history: List[ComplaintHistorySchema] = []

class PublicComplaintTrackingSchema(BaseModel):
    tracking_id: str
    title: str
    category: Optional[str]
    status: ComplaintStatus
    created_at: datetime
    updated_at: Optional[datetime]
    history: List[ComplaintHistorySchema] = []
    
    model_config = {"from_attributes": True}

