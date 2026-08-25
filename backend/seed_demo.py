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
        users_to_seed = [
            {
                "email": "demo@civicshield.local",
                "name": "Demo User",
                "password_plain": "CivicShieldDemo@2026",
                "role": UserRole.CITIZEN
            },
            {
                "email": "officer@demo.local",
                "name": "Officer Jane",
                "password_plain": "officer_password",
                "role": UserRole.OFFICER
            },
            {
                "email": "admin@demo.local",
                "name": "Admin User",
                "password_plain": "admin_password",
                "role": UserRole.ADMIN
            }
        ]

        for user_data in users_to_seed:
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            
            if not existing_user:
                new_user = User(
                    email=user_data["email"],
                    name=user_data["name"],
                    password_hash=get_password_hash(user_data["password_plain"]),
                    role=user_data["role"],
                    is_phone_verified=True,
                    is_active=True
                )
                db.add(new_user)
                db.commit()
                logging.info(f"Seeded account: {user_data['email']}")
            else:
                needs_commit = False
                
                if not existing_user.is_active or not existing_user.is_phone_verified:
                    existing_user.is_active = True
                    existing_user.is_phone_verified = True
                    needs_commit = True
                    
                try:
                    if not verify_password(user_data["password_plain"], existing_user.password_hash):
                        existing_user.password_hash = get_password_hash(user_data["password_plain"])
                        needs_commit = True
                except Exception:
                    existing_user.password_hash = get_password_hash(user_data["password_plain"])
                    needs_commit = True
                    
                if needs_commit:
                    db.commit()
                    
                logging.info(f"Verified/updated account: {user_data['email']}")
                
    except SQLAlchemyError as e:
        db.rollback()
        logging.error("Database error while seeding accounts.")
        sys.exit(1)
    except Exception as e:
        db.rollback()
        logging.error("Unknown error while seeding accounts.")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_user()
