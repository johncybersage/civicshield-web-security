import sys
import os

from app.core.database import SessionLocal
from app.models.complaint import Complaint, ComplaintEvidence, ComplaintComment, ComplaintHistory

def clear_complaints():
    db = SessionLocal()
    try:
        # Delete dependent tables first to respect foreign key constraints
        db.query(ComplaintHistory).delete()
        db.query(ComplaintComment).delete()
        db.query(ComplaintEvidence).delete()
        db.query(Complaint).delete()
        
        db.commit()
        print("Successfully cleared all complaints and related data.")
    except Exception as e:
        db.rollback()
        print(f"Error clearing complaints: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_complaints()
