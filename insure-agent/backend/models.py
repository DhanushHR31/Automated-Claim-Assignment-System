from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Boolean, Text
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="agent") # manager, agent
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, index=True)
    full_name = Column(String)
    phone = Column(String)
    email = Column(String)
    avatar_url = Column(String, nullable=True)
    is_online = Column(Boolean, default=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    city = Column(String, nullable=True)
    district = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AgentPaymentDetail(Base):
    __tablename__ = "agent_payment_details"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, index=True)
    bank_name = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    ifsc_code = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Claim(Base):
    __tablename__ = "claims"
    id = Column(String, primary_key=True, index=True)
    claim_number = Column(String, unique=True, index=True)
    claim_type = Column(String)
    priority = Column(String)
    status = Column(String)
    customer_name = Column(String)
    customer_phone = Column(String)
    policy_number = Column(String)
    incident_description = Column(Text, nullable=True)
    claim_amount = Column(Float)
    location_address = Column(String)
    location_lat = Column(Float)
    location_lng = Column(Float)
    district = Column(String)
    assigned_agent_id = Column(String, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
