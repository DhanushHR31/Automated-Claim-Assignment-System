import uuid
import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_hospital

router = APIRouter(prefix="/claims", tags=["documents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/{claim_id}/documents", response_model=schemas.DocumentOut, status_code=201)
async def upload_document(
    claim_id: str,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    claim = db.query(models.Claim).filter(
        models.Claim.id == claim_id,
        models.Claim.hospital_id == hospital.id,
    ).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    valid_types = [e.value for e in models.DocumentType]
    if document_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid document_type. Must be one of: {valid_types}")

    ext = os.path.splitext(file.filename or "file")[1]
    file_id = str(uuid.uuid4())
    rel_path = f"{hospital.id}/{claim_id}/{file_id}{ext}"
    abs_path = os.path.join(UPLOAD_DIR, rel_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)

    async with aiofiles.open(abs_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    doc = models.ClaimDocument(
        id=file_id,
        claim_id=claim_id,
        document_type=models.DocumentType(document_type),
        file_path=rel_path,
        file_name=file.filename,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{claim_id}/documents", response_model=list[schemas.DocumentOut])
def list_documents(
    claim_id: str,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    claim = db.query(models.Claim).filter(
        models.Claim.id == claim_id,
        models.Claim.hospital_id == hospital.id,
    ).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return db.query(models.ClaimDocument).filter(
        models.ClaimDocument.claim_id == claim_id
    ).order_by(models.ClaimDocument.uploaded_at.desc()).all()


@router.delete("/{claim_id}/documents/{doc_id}", status_code=204)
def delete_document(
    claim_id: str,
    doc_id: str,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    claim = db.query(models.Claim).filter(
        models.Claim.id == claim_id,
        models.Claim.hospital_id == hospital.id,
    ).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    doc = db.query(models.ClaimDocument).filter(
        models.ClaimDocument.id == doc_id,
        models.ClaimDocument.claim_id == claim_id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    abs_path = os.path.join(UPLOAD_DIR, doc.file_path)
    if os.path.exists(abs_path):
        os.remove(abs_path)

    db.delete(doc)
    db.commit()


@router.get("/{claim_id}/documents/{doc_id}/download")
def download_document(
    claim_id: str,
    doc_id: str,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    claim = db.query(models.Claim).filter(
        models.Claim.id == claim_id,
        models.Claim.hospital_id == hospital.id,
    ).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    doc = db.query(models.ClaimDocument).filter(
        models.ClaimDocument.id == doc_id,
        models.ClaimDocument.claim_id == claim_id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    abs_path = os.path.join(UPLOAD_DIR, doc.file_path)
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(abs_path, filename=doc.file_name or "document")
