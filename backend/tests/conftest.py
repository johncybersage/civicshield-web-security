import os
# Set DATABASE_URL to SQLite before any app modules are imported
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Forcefully override the settings module so the app uses SQLite too
from app.core.config import settings
settings.DATABASE_URL = "sqlite:///./test.db"

from fastapi.testclient import TestClient

from app.core.database import Base, get_db
from app.main import app

engine = create_engine(
    os.environ["DATABASE_URL"], connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean up data after each test
        with engine.begin() as conn:
            for table in reversed(Base.metadata.sorted_tables):
                conn.execute(table.delete())

@pytest.fixture(scope="function", autouse=True)
def override_get_db(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    yield
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def client():
    with TestClient(app) as c:
        yield c
