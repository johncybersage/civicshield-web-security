from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.complaint import Priority, ComplaintStatus

class ComplaintCommentBase(BaseModel):
    content: str

class ComplaintCommentCreate(ComplaintCommentBase):
    pass

class ComplaintComment(ComplaintCommentBase):
    id: int
    complaint_id: int
    user_id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}

class ComplaintBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    final_priority: Optional[Priority] = None
    category: Optional[str] = None
    assigned_officer_id: Optional[int] = None

class Complaint(ComplaintBase):
    id: int
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

    model_config = {"from_attributes": True}

class ComplaintWithComments(Complaint):
    comments: List[ComplaintComment] = []
