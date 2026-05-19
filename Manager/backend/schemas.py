from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    AGENT = "agent"


class ClaimStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    CLOSED = "closed"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole = UserRole.AGENT


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Agent Schemas
class AgentBase(BaseModel):
    specialization: str
    experience_years: int
    bio: Optional[str] = None


class AgentCreate(AgentBase):
    user_id: int


class AgentUpdate(BaseModel):
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    status: Optional[str] = None


class AgentResponse(AgentBase):
    id: int
    user_id: int
    performance_rating: float
    total_claims_handled: int
    success_rate: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AgentWithUserResponse(AgentResponse):
    user: UserResponse


# Claim Schemas
class ClaimBase(BaseModel):
    policy_number: str
    customer_name: str
    customer_email: str
    claim_type: str
    amount: float
    description: str
    priority: str = "medium"


class ClaimCreate(ClaimBase):
    pass


class ClaimUpdate(BaseModel):
    status: Optional[ClaimStatus] = None
    assigned_agent_id: Optional[int] = None
    priority: Optional[str] = None
    description: Optional[str] = None


class ClaimResponse(ClaimBase):
    id: int
    claim_number: str
    status: ClaimStatus
    assigned_agent_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClaimDetailResponse(ClaimResponse):
    assigned_agent: Optional[AgentWithUserResponse] = None


# Claim Document Schemas
class ClaimDocumentBase(BaseModel):
    document_name: str
    document_type: str


class ClaimDocumentCreate(ClaimDocumentBase):
    file_path: str


class ClaimDocumentResponse(ClaimDocumentBase):
    id: int
    claim_id: int
    file_path: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


# Claim Note Schemas
class ClaimNoteBase(BaseModel):
    note_text: str


class ClaimNoteCreate(ClaimNoteBase):
    pass


class ClaimNoteResponse(ClaimNoteBase):
    id: int
    claim_id: int
    agent_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Message Schemas
class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    recipient_id: Optional[int] = None


class MessageResponse(MessageBase):
    id: int
    sender_id: int
    recipient_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Analytics Schemas
class AnalyticsResponse(BaseModel):
    id: int
    agent_id: Optional[int] = None
    claims_assigned: int
    claims_resolved: int
    average_resolution_time: float
    customer_satisfaction: float
    month: str
    year: int
    created_at: datetime

    class Config:
        from_attributes = True


# Auth Schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class LoginRequest(BaseModel):
    username: str
    password: str
