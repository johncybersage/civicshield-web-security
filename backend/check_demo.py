import sys
from app.core.database import SessionLocal
from app.models.user import User
from app.security.auth import verify_password

db = SessionLocal()
demo_email = "demo@civicshield.local"
demo_password_plain = "CivicShieldDemo@2026"
existing_demo = db.query(User).filter(User.email == demo_email).first()

if not existing_demo:
    print("Demo user does not exist")
    sys.exit(1)

print("Demo user exists:", existing_demo.email)
if not existing_demo.is_active:
    print("Demo user is inactive")
if not verify_password(demo_password_plain, existing_demo.password_hash):
    print("Password mismatch")
else:
    print("Password matches")
