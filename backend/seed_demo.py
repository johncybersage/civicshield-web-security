import sys
import os
import logging
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.security.auth import get_password_hash, verify_password
from sqlalchemy.exc import SQLAlchemyError

# Configure basic logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

def seed_demo_user():
    db = SessionLocal()
    try:
        demo_email = "demo@civicshield.local"
        demo_password_plain = "CivicShieldDemo@2026"
        existing_demo = db.query(User).filter(User.email == demo_email).first()
        
        if not existing_demo:
            # Create user if missing
            demo_user = User(
                email=demo_email,
                name="Demo User",
                password_hash=get_password_hash(demo_password_plain),
                role=UserRole.CITIZEN,
                is_phone_verified=True,
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            logging.info("Demo account ready.")
        else:
            # Idempotent robust check
            needs_commit = False
            
            if not existing_demo.is_active or not existing_demo.is_phone_verified:
                existing_demo.is_active = True
                existing_demo.is_phone_verified = True
                needs_commit = True
                
            # Verify and conditionally rehash password
            try:
                if not verify_password(demo_password_plain, existing_demo.password_hash):
                    existing_demo.password_hash = get_password_hash(demo_password_plain)
                    needs_commit = True
            except Exception:
                # Catch any issues with verify_password (e.g. unknown hash algorithm from old data)
                existing_demo.password_hash = get_password_hash(demo_password_plain)
                needs_commit = True
                
            if needs_commit:
                db.commit()
                
            logging.info("Demo account ready.")
            
    except SQLAlchemyError as e:
        db.rollback()
        logging.error("Database error while seeding demo account.")
        sys.exit(1)
    except Exception as e:
        db.rollback()
        logging.error("Unknown error while seeding demo account.")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_user()
