from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class Priority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ComplaintStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=True) # E.g., Infrastructure, Safety, etc.
    
    # AI Assistance Fields
    ai_category = Column(String, nullable=True)
    ai_priority = Column(SQLEnum(Priority), nullable=True)
    
    # Final decided priority
    final_priority = Column(SQLEnum(Priority), default=Priority.LOW)
    status = Column(SQLEnum(ComplaintStatus), default=ComplaintStatus.SUBMITTED)
    location = Column(String, nullable=True)
    
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    citizen = relationship("User", foreign_keys=[citizen_id], backref="complaints_submitted")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], backref="complaints_assigned")
    comments = relationship("ComplaintComment", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintComment(Base):
    __tablename__ = "complaint_comments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="comments")
    user = relationship("User", backref="comments")
