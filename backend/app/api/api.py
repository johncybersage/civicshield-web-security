from fastapi import APIRouter
from app.api.endpoints import auth, users, complaints, admin, security

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(complaints.router, prefix="/complaints", tags=["complaints"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
