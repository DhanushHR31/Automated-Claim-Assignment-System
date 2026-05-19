import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas
from app.auth import get_current_hospital

router = APIRouter(prefix="/claims", tags=["claims"])


def _claim_number():
    ts = datetime.utcnow().strftime("%Y%m%d")
    short = str(uuid.uuid4().int)[:5]
    return f"CLM-{ts}-{short.zfill(5)}"


def _load_claim(claim_id: str, hospital: models.Hospital, db: Session) -> models.Claim:
    claim = (
        db.query(models.Claim)
        .options(
            joinedload(models.Claim.policy).joinedload(models.Policy.insurance_company),
            joinedload(models.Claim.patient_details),
            joinedload(models.Claim.documents),
            joinedload(models.Claim.approvals),
            joinedload(models.Claim.billing),
            joinedload(models.Claim.payments),
        )
        .filter(models.Claim.id == claim_id, models.Claim.hospital_id == hospital.id)
        .first()
    )
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@router.get("/", response_model=list[schemas.ClaimListItem])
def list_claims(
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Claim)
        .options(joinedload(models.Claim.policy).joinedload(models.Policy.insurance_company))
        .filter(models.Claim.hospital_id == hospital.id)
        .order_by(models.Claim.created_at.desc())
        .all()
    )


@router.post("/", response_model=schemas.ClaimOut, status_code=201)
def create_claim(
    body: schemas.ClaimCreate,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    policy = db.query(models.Policy).filter(models.Policy.id == body.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.status != models.PolicyStatus.active:
        raise HTTPException(status_code=400, detail="Policy is expired — cannot file claim")

    claim_id = str(uuid.uuid4())
    claim = models.Claim(
        id=claim_id,
        claim_number=_claim_number(),
        hospital_id=hospital.id,
        policy_id=policy.id,
        claim_status=models.ClaimStatus.initiated,
        diagnosis=body.diagnosis,
        treatment_details=body.treatment_details,
        doctor_name=body.doctor_name,
        admission_date=body.admission_date,
        discharge_date=body.discharge_date,
        estimated_amount=body.estimated_amount or 0,
    )
    db.add(claim)

    patient = models.ClaimPatientDetail(
        id=str(uuid.uuid4()),
        claim_id=claim_id,
        patient_name=body.patient_name,
        age=body.age,
        gender=body.gender,
        aadhaar=body.aadhaar,
        pan=body.pan,
        contact=body.contact,
        email=body.patient_email,
        relation_to_holder=body.relation_to_holder,
        is_corporate=body.is_corporate,
        employee_id=body.employee_id,
    )
    db.add(patient)
    db.commit()

    return _load_claim(claim_id, hospital, db)


@router.get("/{claim_id}", response_model=schemas.ClaimOut)
def get_claim(
    claim_id: str,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    return _load_claim(claim_id, hospital, db)


@router.post("/{claim_id}/submit", response_model=schemas.ClaimOut)
def submit_for_approval(
    claim_id: str,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    claim = _load_claim(claim_id, hospital, db)
    if not claim.documents:
        raise HTTPException(status_code=400, detail="Upload at least one document first")

    approval = models.ClaimApproval(
        id=str(uuid.uuid4()),
        claim_id=claim.id,
        company_id=claim.policy.insurance_company.id,
        approval_status=models.ApprovalStatus.pending,
    )
    db.add(approval)
    claim.claim_status = models.ClaimStatus.pending_approval
    db.commit()
    return _load_claim(claim_id, hospital, db)


@router.post("/{claim_id}/simulate-approval", response_model=schemas.ClaimOut)
def simulate_approval(
    claim_id: str,
    body: schemas.ApprovalSimulate,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    claim = _load_claim(claim_id, hospital, db)
    decision = body.decision
    if decision not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="decision must be 'approved' or 'rejected'")

    remarks = "Approved per policy coverage." if decision == "approved" else "Rejected — incomplete documentation."
    for appr in claim.approvals:
        appr.approval_status = models.ApprovalStatus(decision)
        appr.remarks = remarks
        appr.decided_at = datetime.utcnow()

    claim.claim_status = models.ClaimStatus(decision)
    db.commit()
    return _load_claim(claim_id, hospital, db)


@router.post("/{claim_id}/simulate-verification", response_model=schemas.ClaimOut)
def simulate_verification(
    claim_id: str,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    claim = _load_claim(claim_id, hospital, db)
    claim.claim_status = models.ClaimStatus.under_verification
    db.commit()
    return _load_claim(claim_id, hospital, db)


@router.post("/{claim_id}/simulate-payment", response_model=schemas.ClaimOut)
def simulate_payment(
    claim_id: str,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    import random, string
    from datetime import date
    claim = _load_claim(claim_id, hospital, db)
    txn = "TXN-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=10))
    payment = models.ClaimPayment(
        id=str(uuid.uuid4()),
        claim_id=claim.id,
        amount_paid=claim.approved_amount or claim.estimated_amount or 0,
        payment_date=date.today(),
        transaction_id=txn,
        payment_status=models.PaymentStatus.completed,
    )
    db.add(payment)
    claim.claim_status = models.ClaimStatus.paid
    db.commit()
    return _load_claim(claim_id, hospital, db)


@router.post("/{claim_id}/billing", response_model=schemas.ClaimOut, status_code=201)
def submit_billing(
    claim_id: str,
    body: schemas.BillingCreate,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    claim = _load_claim(claim_id, hospital, db)
    billing = models.ClaimBilling(
        id=str(uuid.uuid4()),
        claim_id=claim.id,
        total_bill=body.total_bill,
        pharmacy_bill=body.pharmacy_bill,
        notes=body.notes,
    )
    db.add(billing)
    db.commit()
    return _load_claim(claim_id, hospital, db)
