from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_hospital

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    claims = (
        db.query(models.Claim)
        .filter(models.Claim.hospital_id == hospital.id)
        .all()
    )

    counts = {"total": 0, "pending": 0, "approved": 0, "rejected": 0, "paid": 0}
    monthly: dict[str, int] = {}

    for c in claims:
        counts["total"] += 1
        status = c.claim_status.value if hasattr(c.claim_status, "value") else c.claim_status
        if status in ("pending_approval", "under_verification"):
            counts["pending"] += 1
        elif status == "approved":
            counts["approved"] += 1
        elif status == "rejected":
            counts["rejected"] += 1
        elif status == "paid":
            counts["paid"] += 1

        month_key = MONTHS[c.created_at.month - 1]
        monthly[month_key] = monthly.get(month_key, 0) + 1

    chart = [{"name": m, "claims": monthly.get(m, 0)} for m in MONTHS]

    return schemas.DashboardStats(
        total=counts["total"],
        pending=counts["pending"],
        approved=counts["approved"],
        rejected=counts["rejected"],
        paid=counts["paid"],
        monthly=chart,
        hospital_name=hospital.hospital_name,
    )
