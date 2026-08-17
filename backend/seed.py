from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.security.auth import get_password_hash
from app.models.complaint import Complaint, Priority, ComplaintStatus

def seed_db():
    db = SessionLocal()
    
    # Check if users already exist
    if db.query(User).count() > 0:
        print("Database already seeded.")
        return

    # Create demo accounts
    admin = User(
        name="Admin User",
        email="admin@demo.local",
        password_hash=get_password_hash("admin_password"),
        role=UserRole.ADMIN
    )
    
    officer = User(
        name="Officer Jane",
        email="officer@demo.local",
        password_hash=get_password_hash("officer_password"),
        role=UserRole.OFFICER
    )
    
    citizen = User(
        name="Citizen Smith",
        email="citizen@demo.local",
        password_hash=get_password_hash("citizen_password"),
        role=UserRole.CITIZEN
    )

    db.add_all([admin, officer, citizen])
    db.commit()
    
    # Create some demo complaints
    c1 = Complaint(
        title="Broken Streetlight on 5th Ave",
        description="The streetlight near the bus stop is completely out. It is very dark and dangerous at night.",
        category="Infrastructure",
        ai_category="Infrastructure",
        ai_priority=Priority.MEDIUM,
        final_priority=Priority.MEDIUM,
        status=ComplaintStatus.IN_PROGRESS,
        location="5th Ave & Main St",
        citizen_id=citizen.id,
        assigned_officer_id=officer.id
    )
    
    c2 = Complaint(
        title="Deep Pothole",
        description="Massive pothole that could damage cars.",
        category="Roads",
        ai_category="Infrastructure",
        ai_priority=Priority.HIGH,
        final_priority=Priority.HIGH,
        status=ComplaintStatus.SUBMITTED,
        location="Elm Street",
        citizen_id=citizen.id
    )
    
    c3_xss_test = Complaint(
        title="Test XSS Payload",
        description="<img src=x onerror=alert('Stored XSS Executed!')>",
        category="Security Testing",
        status=ComplaintStatus.REJECTED,
        citizen_id=citizen.id
    )

    db.add_all([c1, c2, c3_xss_test])
    db.commit()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_db()
