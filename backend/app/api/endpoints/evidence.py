import os
import uuid
import magic
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from supabase import create_client, Client

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ComplaintEvidence
from app.api.deps import get_current_user
from app.api.endpoints.auth import log_audit
from app.core.rate_limit import limiter

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

supabase_client: Client | None = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

@router.post("/{complaint_id}/evidence")
@limiter.limit("10/minute")
async def upload_evidence(
    complaint_id: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Upload evidence for a complaint."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # Strict Authorization
    if current_user.role == UserRole.CITIZEN and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Read first chunk to verify size and sniff MIME type securely
    chunk_for_magic = await file.read(2048)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    mime_type = magic.from_buffer(chunk_for_magic, mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file content type ({mime_type}). Only JPEG, PNG, and WebP are allowed.")

    # Secure filename generation to prevent path traversal
    ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'bin'
    secure_filename = f"{uuid.uuid4()}.{ext}"

    if supabase_client:
        bucket_name = "evidence"
        try:
            file_bytes = await file.read()
            supabase_client.storage.from_(bucket_name).upload(secure_filename, file_bytes, {"content-type": mime_type})
            file_path = f"supabase://{bucket_name}/{secure_filename}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload to remote storage: {str(e)}")
    else:
        file_path = os.path.join(UPLOAD_DIR, secure_filename)
        with open(file_path, "wb") as buffer:
            buffer.write(chunk_for_magic)
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                buffer.write(chunk)

    evidence = ComplaintEvidence(
        complaint_id=complaint_id,
        file_path=file_path,
        file_type=mime_type,
        uploaded_by=current_user.id
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    log_audit(db, "EVIDENCE_UPLOADED", current_user.id, request, f"Complaint ID: {complaint_id}, File: {secure_filename}")
    
    return {"message": "Evidence uploaded successfully", "id": evidence.id}

@router.get("/evidence/{evidence_id}")
def get_evidence(
    evidence_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Securely download/view evidence."""
    evidence = db.query(ComplaintEvidence).filter(ComplaintEvidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    complaint = db.query(Complaint).filter(Complaint.id == evidence.complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Strict Authorization
    if current_user.role == UserRole.CITIZEN and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    log_audit(db, "EVIDENCE_VIEWED", current_user.id, request, f"Evidence ID: {evidence_id}")
    
    if evidence.file_path.startswith("supabase://"):
        if not supabase_client:
            raise HTTPException(status_code=500, detail="Storage client not configured")
        parts = evidence.file_path.replace("supabase://", "").split("/")
        bucket_name = parts[0]
        filename = "/".join(parts[1:])
        try:
            res = supabase_client.storage.from_(bucket_name).create_signed_url(filename, 60)
            # The Supabase Python client returns a signed URL string, or a dict. Let's handle both.
            signed_url = res if isinstance(res, str) else res.get("signedURL")
            if not signed_url:
                 raise Exception("No signed URL returned")
            return RedirectResponse(signed_url)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to retrieve file from remote storage: {e}")
    else:
        if not os.path.exists(evidence.file_path):
            raise HTTPException(status_code=404, detail="File not found on server")
        return FileResponse(evidence.file_path, media_type=evidence.file_type)
