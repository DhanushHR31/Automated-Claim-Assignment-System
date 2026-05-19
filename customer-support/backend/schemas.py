from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "manager"

class UserCreate(UserBase):
    password: str

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

class ClaimBase(BaseModel):
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

class ClaimCreate(ClaimBase):
    pass

class Claim(ClaimBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

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


class CustomerBase(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    policy_number: Optional[str] = None
    status: str = "active"

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


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
