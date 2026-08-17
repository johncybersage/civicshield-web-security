from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    ip_address: Optional[str] = None
    metadata_info: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLog(AuditLogBase):
    id: int
    timestamp: datetime

    model_config = {"from_attributes": True}

class SecurityEventBase(BaseModel):
    event_type: str
    severity: str
    description: str
    user_id: Optional[int] = None
    source_ip: Optional[str] = None

class SecurityEventCreate(SecurityEventBase):
    pass

class SecurityEvent(SecurityEventBase):
    id: int
    timestamp: datetime

    model_config = {"from_attributes": True}
