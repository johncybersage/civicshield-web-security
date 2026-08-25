from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.notification import NotificationType

class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: NotificationType
    related_complaint_tracking_id: Optional[str] = None

class NotificationSchema(NotificationBase):
    id: int
    recipient_id: int
    is_read: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}
