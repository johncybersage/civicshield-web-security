from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum, Float, Boolean
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

class LocationSource(str, enum.Enum):
    GPS = "GPS"
    MANUAL_PIN = "MANUAL_PIN"
    ADDRESS_SEARCH = "ADDRESS_SEARCH"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String, unique=True, index=True, nullable=True) # Will be backfilled
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    phone_number = Column(String, nullable=True)
    category = Column(String, nullable=True) # E.g., Infrastructure, Safety, etc.
    
    # AI Assistance Fields
    ai_category = Column(String, nullable=True)
    ai_priority = Column(SQLEnum(Priority), nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_department = Column(String, nullable=True)
    ai_next_action = Column(String, nullable=True)
    
    # Final decided priority
    final_priority = Column(SQLEnum(Priority), default=Priority.LOW)
    status = Column(SQLEnum(ComplaintStatus), default=ComplaintStatus.SUBMITTED)
    location = Column(String, nullable=True)
    
    # Advanced Location fields
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_accuracy = Column(Float, nullable=True)
    location_source = Column(SQLEnum(LocationSource), nullable=True)
    human_readable_address = Column(String, nullable=True)
    
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    citizen = relationship("User", foreign_keys=[citizen_id], backref="complaints_submitted")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], backref="complaints_assigned")
    comments = relationship("ComplaintComment", back_populates="complaint", cascade="all, delete-orphan")
    evidence = relationship("ComplaintEvidence", back_populates="complaint", cascade="all, delete-orphan")
    history = relationship("ComplaintHistory", back_populates="complaint", cascade="all, delete-orphan", order_by="desc(ComplaintHistory.created_at)")
    feedback = relationship("ComplaintFeedback", back_populates="complaint", cascade="all, delete-orphan", uselist=False)

class ComplaintFeedback(Base):
    __tablename__ = "complaint_feedback"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # 1 to 5
    resolved_confirmed = Column(Boolean, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    complaint = relationship("Complaint", back_populates="feedback")
    user = relationship("User")

class ComplaintEvidence(Base):
    __tablename__ = "complaint_evidence"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="evidence")

class ComplaintComment(Base):
    __tablename__ = "complaint_comments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="comments")
    user = relationship("User", backref="comments")

class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    old_status = Column(SQLEnum(ComplaintStatus), nullable=True)
    new_status = Column(SQLEnum(ComplaintStatus), nullable=False)
    note = Column(Text, nullable=True)
    updated_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="history")
    updated_by = relationship("User", foreign_keys=[updated_by_user_id])
