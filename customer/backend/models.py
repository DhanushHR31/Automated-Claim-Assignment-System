from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    full_name = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class KYC_Document(Base):
    __tablename__ = "kyc_documents"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    document_type = Column(String) # aadhaar, pan, etc.
    document_number = Column(String, nullable=True)
    file_url = Column(String, nullable=True)
    verification_status = Column(String, default="pending")
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    policy_number = Column(String, unique=True)
    name = Column(String)
    type = Column(String) # Health, Life, Vehicle, etc.
    provider = Column(String, nullable=True)
    premium = Column(Float, default=0.0)
    coverage = Column(Float, default=0.0)
    status = Column(String, default="Pending")
    expiry_date = Column(String)
    auto_payment = Column(Boolean, default=False)
    payment_method = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Claim(Base):
    __tablename__ = "claims"
    id = Column(String, primary_key=True, index=True)
    policy_id = Column(String, ForeignKey("insurance_policies.id"))
    user_id = Column(String, ForeignKey("users.id"))
    description = Column(String, nullable=True)
    amount = Column(Float, default=0.0)
    status = Column(String, default="Submitted")
    progress = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
