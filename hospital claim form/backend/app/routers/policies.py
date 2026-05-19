from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas
from app.auth import get_current_hospital

router = APIRouter(prefix="/policies", tags=["policies"])


@router.get("/lookup", response_model=schemas.PolicyOut)
def lookup_policy(
    policy_number: str,
    db: Session = Depends(get_db),
    _: models.Hospital = Depends(get_current_hospital),
):
    policy = (
        db.query(models.Policy)
        .options(joinedload(models.Policy.insurance_company))
        .filter(models.Policy.policy_number == policy_number.strip())
        .first()
    )
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found. Try POL-1001.")
    return policy
