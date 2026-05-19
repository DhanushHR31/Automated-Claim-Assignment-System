from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date


# ── Auth ──────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    password: str
    hospital_name: str = "My Hospital"


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


# ── Hospital ──────────────────────────────────────────────────────────────────
class HospitalOut(BaseModel):
    id: str
    hospital_name: str
    email: Optional[str]
    contact_number: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    license_number: Optional[str]
    specialization: Optional[str]
    bed_capacity: Optional[int]
    model_config = {"from_attributes": True}


class HospitalUpdate(BaseModel):
    hospital_name: Optional[str] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    bed_capacity: Optional[int] = None


# ── Insurance Company ─────────────────────────────────────────────────────────
class InsuranceCompanyOut(BaseModel):
    id: str
    company_name: str
    model_config = {"from_attributes": True}


# ── Policy ────────────────────────────────────────────────────────────────────
class PolicyOut(BaseModel):
    id: str
    policy_number: str
    customer_name: str
    aadhaar_number: Optional[str]
    pan_number: Optional[str]
    contact_number: Optional[str]
    email: Optional[str]
    policy_type: str
    coverage_amount: float
    start_date: date
    end_date: date
    status: str
    corporate_company_name: Optional[str]
    insurance_company: Optional[InsuranceCompanyOut]
    model_config = {"from_attributes": True}


# ── Claims ────────────────────────────────────────────────────────────────────
class ClaimCreate(BaseModel):
    policy_id: str
    diagnosis: Optional[str] = None
    treatment_details: Optional[str] = None
    doctor_name: Optional[str] = None
    admission_date: Optional[date] = None
    discharge_date: Optional[date] = None
    estimated_amount: Optional[float] = 0
    patient_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    aadhaar: Optional[str] = None
    pan: Optional[str] = None
    contact: Optional[str] = None
    patient_email: Optional[str] = None
    relation_to_holder: Optional[str] = None
    is_corporate: bool = False
    employee_id: Optional[str] = None


class PatientDetailOut(BaseModel):
    patient_name: str
    age: Optional[int]
    gender: Optional[str]
    is_corporate: bool
    employee_id: Optional[str]
    model_config = {"from_attributes": True}


class PolicySummary(BaseModel):
    policy_number: str
    customer_name: str
    coverage_amount: float
    insurance_company: Optional[InsuranceCompanyOut]
    model_config = {"from_attributes": True}


class ClaimOut(BaseModel):
    id: str
    claim_number: str
    claim_status: str
    diagnosis: Optional[str]
    doctor_name: Optional[str]
    admission_date: Optional[date]
    discharge_date: Optional[date]
    estimated_amount: Optional[float]
    approved_amount: Optional[float]
    remarks: Optional[str]
    created_at: datetime
    policy: Optional[PolicySummary]
    patient_details: Optional[PatientDetailOut]
    model_config = {"from_attributes": True}


class ClaimListItem(BaseModel):
    id: str
    claim_number: str
    claim_status: str
    estimated_amount: Optional[float]
    created_at: datetime
    policy: Optional[PolicySummary]
    model_config = {"from_attributes": True}


# ── Documents ─────────────────────────────────────────────────────────────────
class DocumentOut(BaseModel):
    id: str
    document_type: str
    file_path: str
    file_name: Optional[str]
    uploaded_at: datetime
    model_config = {"from_attributes": True}


# ── Approvals ─────────────────────────────────────────────────────────────────
class ApprovalOut(BaseModel):
    id: str
    approval_status: str
    remarks: Optional[str]
    decided_at: Optional[datetime]
    created_at: datetime
    model_config = {"from_attributes": True}


class ApprovalSimulate(BaseModel):
    decision: str  # "approved" | "rejected"


# ── Billing ───────────────────────────────────────────────────────────────────
class BillingCreate(BaseModel):
    total_bill: float
    pharmacy_bill: Optional[float] = None
    notes: Optional[str] = None


class BillingOut(BaseModel):
    id: str
    total_bill: float
    pharmacy_bill: Optional[float]
    notes: Optional[str]
    submitted_at: datetime
    claim: Optional[dict] = None
    model_config = {"from_attributes": True}


# ── Payments ──────────────────────────────────────────────────────────────────
class PaymentOut(BaseModel):
    id: str
    amount_paid: float
    payment_date: Optional[date]
    transaction_id: Optional[str]
    payment_status: str
    created_at: datetime
    claim: Optional[dict] = None
    model_config = {"from_attributes": True}


# ── Support ───────────────────────────────────────────────────────────────────
class TicketCreate(BaseModel):
    subject: str
    issue: str


class TicketOut(BaseModel):
    id: str
    subject: str
    issue: str
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    message: str


class MessageOut(BaseModel):
    id: str
    sender_id: str
    sender_role: str
    message: str
    sent_at: datetime
    model_config = {"from_attributes": True}


# ── Dashboard ─────────────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    total: int
    pending: int
    approved: int
    rejected: int
    paid: int
    monthly: List[dict]
    hospital_name: str
