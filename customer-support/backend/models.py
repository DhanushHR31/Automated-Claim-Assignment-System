from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql import func
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="manager") # manager, agent
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Manager(Base):
    __tablename__ = "managers"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True)
    name = Column(String)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    department = Column(String, nullable=True)
    max_agents = Column(Integer, default=50)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    home_city = Column(String)
    home_state = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    availability = Column(String, default="available")
    working_hours_start = Column(String, default="09:00")
    working_hours_end = Column(String, default="18:00")
    travel_allowed = Column(Boolean, default=True)
    performance_score = Column(Integer, default=0)
    active_claims = Column(Integer, default=0)
    agent_code = Column(String, unique=True)
    manager_id = Column(String, nullable=True)
    user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, index=True)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    claim_type = Column(String)
    urgency = Column(String)
    status = Column(String, default="pending")
    description = Column(String)
    estimated_value = Column(Float)
    assigned_agent_id = Column(String, nullable=True)
    claim_code = Column(String, unique=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String, primary_key=True, index=True)
    claim_id = Column(String)
    agent_id = Column(String)
    assignment_code = Column(String, unique=True)
    assigned_time = Column(DateTime, default=datetime.datetime.utcnow)
    distance = Column(Float)
    travel_cost = Column(Float)
    hotel_cost = Column(Float)
    total_cost = Column(Float)
    status = Column(String, default="pending")
    overridden = Column(Boolean, default=False)
    override_reason = Column(String, nullable=True)
    overridden_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    action = Column(String)
    claim_id = Column(String, nullable=True)
    agent_id = Column(String, nullable=True)
    performed_by = Column(String)
    details = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    policy_number = Column(String, nullable=True)
    status = Column(String, default="active")  # active, inactive
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    address = Column(String, nullable=True)
    city = Column(String)
    state = Column(String)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    specializations = Column(String, nullable=True)  # comma-separated
    beds = Column(Integer, nullable=True)
    empanelled = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
