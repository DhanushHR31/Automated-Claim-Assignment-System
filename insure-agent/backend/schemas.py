from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "agent"

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None

class ProfileBase(BaseModel):
    full_name: str
    phone: str
    email: str
    avatar_url: Optional[str] = None
    is_online: bool = True
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    city: Optional[str] = None
    district: Optional[str] = None

class ProfileCreate(ProfileBase):
    id: str
    user_id: str

class Profile(ProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaymentDetailBase(BaseModel):
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None

class PaymentDetail(PaymentDetailBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ClaimBase(BaseModel):
    claim_number: str
    claim_type: str
    priority: str
    status: str
    customer_name: str
    customer_phone: str
    policy_number: str
    incident_description: Optional[str] = None
    claim_amount: float
    location_address: str
    location_lat: float
    location_lng: float
    district: str
    assigned_agent_id: Optional[str] = None
    assigned_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class ClaimCreate(ClaimBase):
    id: str

class Claim(ClaimBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
