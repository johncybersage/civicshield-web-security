from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class NotificationType(str, enum.Enum):
    COMPLAINT_UPDATE = "COMPLAINT_UPDATE"
    NEW_MESSAGE = "NEW_MESSAGE"
    FEEDBACK_REQUEST = "FEEDBACK_REQUEST"
    SYSTEM = "SYSTEM"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(SQLEnum(NotificationType), default=NotificationType.SYSTEM, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    related_complaint_tracking_id = Column(String, nullable=True) # Optional tracking ID to navigate
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    recipient = relationship("User")
