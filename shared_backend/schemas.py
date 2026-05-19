from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = "customer"   # customer | manager | agent

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None

# OAuth2 form-based login (for customer-support manager login)
class ManagerLoginForm(BaseModel):
    username: str   # email
    password: str


# ─── Profile ─────────────────────────────────────────────────────────────────
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ─── KYC ─────────────────────────────────────────────────────────────────────
class KYCDocumentBase(BaseModel):
    document_type: str
    document_number: Optional[str] = None
    file_url: Optional[str] = None
    verification_status: Optional[str] = "pending"
    notes: Optional[str] = None

class KYCDocumentCreate(KYCDocumentBase):
    pass

class KYCDocument(KYCDocumentBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ─── Insurance Policy ────────────────────────────────────────────────────────
class InsurancePolicyBase(BaseModel):
    policy_number: str
    name: str
    type: str
    provider: Optional[str] = None
    premium: Optional[float] = 0.0
    coverage: Optional[float] = 0.0
    status: Optional[str] = "Pending"
    expiry_date: str
    auto_payment: Optional[bool] = False
    payment_method: Optional[str] = None

class InsurancePolicyCreate(InsurancePolicyBase):
    pass

class InsurancePolicy(InsurancePolicyBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ─── Customer Claim (portal) ─────────────────────────────────────────────────
class CustomerClaimBase(BaseModel):
    policy_id: str
    description: Optional[str] = None
    amount: Optional[float] = 0.0
    status: Optional[str] = "Submitted"
    progress: Optional[int] = 0
    is_verified: Optional[bool] = False
    settled_amount: Optional[float] = None

class CustomerClaimCreate(CustomerClaimBase):
    pass

class CustomerClaim(CustomerClaimBase):
    id: str
    user_id: str
    submitted_at: datetime
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ─── Payment Record ───────────────────────────────────────────────────────────
class PaymentRecordBase(BaseModel):
    policy_id: str
    policy_number: Optional[str] = None
    policy_name: Optional[str] = None
    amount: float
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    status: Optional[str] = "success"
    payment_type: Optional[str] = "premium"
    month_number: Optional[int] = None
    notes: Optional[str] = None

class PaymentRecordCreate(PaymentRecordBase):
    pass

class PaymentRecord(PaymentRecordBase):
    id: str
    user_id: str
    paid_at: datetime
    created_at: datetime
    class Config:
        from_attributes = True


# ─── Full Customer Detail (for customer-support view) ────────────────────────
class CustomerDetail(BaseModel):
    user: UserOut
    profile: Optional[Profile] = None
    kyc_documents: List[KYCDocument] = []
    insurance_policies: List[InsurancePolicy] = []
    claims: List[CustomerClaim] = []


# ─── Manager ─────────────────────────────────────────────────────────────────
class ManagerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    max_agents: int = 50
    active: bool = True
    user_id: Optional[str] = None

class ManagerCreate(ManagerBase):
    pass

class Manager(ManagerBase):
    id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ─── Agent ───────────────────────────────────────────────────────────────────
class AgentBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    home_city: str
    home_state: str
    latitude: float
    longitude: float
    availability: str = "available"
    working_hours_start: str = "09:00"
    working_hours_end: str = "18:00"
    travel_allowed: bool = True
    performance_score: int = 0
    active_claims: int = 0
    agent_code: Optional[str] = None
    manager_id: Optional[str] = None
    user_id: Optional[str] = None

class AgentCreate(AgentBase):
    pass

class Agent(AgentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ─── Support Claim ───────────────────────────────────────────────────────────
class SupportClaimBase(BaseModel):
    address: str
    city: str
    state: str
    latitude: float
    longitude: float
    claim_type: str
    urgency: str
    status: str = "pending"
    description: str
    estimated_value: float
    assigned_agent_id: Optional[str] = None
    claim_code: Optional[str] = None
    created_by: Optional[str] = None
    customer_claim_id: Optional[str] = None
    customer_user_id: Optional[str] = None
    is_verified: Optional[bool] = False
    settled_amount: Optional[float] = None

class SupportClaimCreate(SupportClaimBase):
    pass

class SupportClaim(SupportClaimBase):
    id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ─── Assignment ──────────────────────────────────────────────────────────────
class AssignmentBase(BaseModel):
    claim_id: str
    agent_id: str
    distance: float
    travel_cost: float
    hotel_cost: float
    total_cost: float
    status: str = "pending"
    overridden: bool = False
    override_reason: Optional[str] = None
    overridden_by: Optional[str] = None

class AssignmentCreate(AssignmentBase):
    pass

class Assignment(AssignmentBase):
    id: str
    assignment_code: str
    assigned_time: datetime
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ─── Audit Log ───────────────────────────────────────────────────────────────
class AuditLogBase(BaseModel):
    action: str
    claim_id: Optional[str] = None
    agent_id: Optional[str] = None
    performed_by: str
    details: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLog(AuditLogBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True


# ─── Hospital ────────────────────────────────────────────────────────────────
class HospitalBase(BaseModel):
    name: str
    address: Optional[str] = None
    city: str
    state: str
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    specializations: Optional[str] = None
    beds: Optional[int] = None
    empanelled: bool = True
    rating: float = 0.0

class HospitalCreate(HospitalBase):
    pass

class Hospital(HospitalBase):
    id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
