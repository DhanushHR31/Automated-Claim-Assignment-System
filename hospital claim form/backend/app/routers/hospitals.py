from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_hospital

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.get("/me", response_model=schemas.HospitalOut)
def get_my_hospital(hospital: models.Hospital = Depends(get_current_hospital)):
    return hospital


@router.put("/me", response_model=schemas.HospitalOut)
def update_my_hospital(
    body: schemas.HospitalUpdate,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(hospital, field, value)
    db.commit()
    db.refresh(hospital)
    return hospital
