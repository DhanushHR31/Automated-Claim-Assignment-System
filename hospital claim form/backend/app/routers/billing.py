from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models
from app.auth import get_current_hospital
from typing import List, Any

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/", response_model=List[Any])
def list_billing(
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.ClaimBilling)
        .join(models.Claim)
        .options(
            joinedload(models.ClaimBilling.claim)
            .joinedload(models.Claim.policy)
        )
        .filter(models.Claim.hospital_id == hospital.id)
        .order_by(models.ClaimBilling.submitted_at.desc())
        .all()
    )
    result = []
    for r in rows:
        result.append({
            "id": r.id,
            "total_bill": r.total_bill,
            "pharmacy_bill": r.pharmacy_bill,
            "submitted_at": r.submitted_at.isoformat(),
            "claim": {
                "claim_number": r.claim.claim_number,
                "claim_status": r.claim.claim_status.value,
                "patient_name": r.claim.policy.customer_name if r.claim.policy else None,
            } if r.claim else None,
        })
    return result
