from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models
from app.auth import get_current_hospital
from typing import List, Any

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/", response_model=List[Any])
def list_payments(
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.ClaimPayment)
        .join(models.Claim)
        .options(
            joinedload(models.ClaimPayment.claim)
            .joinedload(models.Claim.policy)
            .joinedload(models.Policy.insurance_company)
        )
        .filter(models.Claim.hospital_id == hospital.id)
        .order_by(models.ClaimPayment.created_at.desc())
        .all()
    )
    result = []
    for r in rows:
        result.append({
            "id": r.id,
            "amount_paid": r.amount_paid,
            "payment_date": r.payment_date.isoformat() if r.payment_date else None,
            "transaction_id": r.transaction_id,
            "payment_status": r.payment_status.value,
            "created_at": r.created_at.isoformat(),
            "claim": {
                "claim_number": r.claim.claim_number,
                "patient_name": r.claim.policy.customer_name if r.claim.policy else None,
                "company_name": r.claim.policy.insurance_company.company_name
                    if r.claim.policy and r.claim.policy.insurance_company else None,
            } if r.claim else None,
        })
    return result
