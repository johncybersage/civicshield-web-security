import asyncio
from app.core.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.audit import AuditLog

try:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    print("Users table:", engine.dialect.has_table(engine.connect(), "users"))
    print("AuditLogs table:", engine.dialect.has_table(engine.connect(), "audit_logs"))
except Exception as e:
    print("Error:", e)
