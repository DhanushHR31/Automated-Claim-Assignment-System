from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

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

class ClaimBase(BaseModel):
    policy_id: str
    description: Optional[str] = None
    amount: Optional[float] = 0.0
    status: Optional[str] = "Submitted"
    progress: Optional[int] = 0

class ClaimCreate(ClaimBase):
    pass

class Claim(ClaimBase):
    id: str
    user_id: str
    submitted_at: datetime
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
