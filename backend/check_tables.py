from app.api.api import api_router
from app.core.database import Base
print("Tables:", list(Base.metadata.tables.keys()))
