from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql import func
import datetime


# ─────────────────────────────────────────────
#  SHARED AUTH — customers use role="customer",
#                support staff use role="manager"/"agent"
# ─────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    role = Column(String, default="customer")   # customer | manager | agent
    is_active = Column(Boolean, default=True)
    custom_id = Column(String, unique=True, index=True, nullable=True) # 8-digit random ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("Profile", back_populates="user", uselist=False)
    kyc_documents = relationship("KYCDocument", back_populates="user")
    insurance_policies = relationship("InsurancePolicy", back_populates="user")
    customer_claims = relationship("CustomerClaim", back_populates="user")
    payment_records = relationship("PaymentRecord", back_populates="user")


# ─────────────────────────────────────────────
#  CUSTOMER PORTAL TABLES
# ─────────────────────────────────────────────
class Profile(Base):
    __tablename__ = "profiles"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    full_name = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")


class KYCDocument(Base):
    __tablename__ = "kyc_documents"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    document_type = Column(String)          # aadhaar, pan, passport, etc.
    document_number = Column(String, nullable=True)
    file_url = Column(String, nullable=True)
    verification_status = Column(String, default="pending")  # pending | verified | rejected
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="kyc_documents")


class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    policy_number = Column(String, unique=True)
    name = Column(String)
    type = Column(String)                   # Health, Life, Vehicle, etc.
    provider = Column(String, nullable=True)
    premium = Column(Float, default=0.0)
    coverage = Column(Float, default=0.0)
    status = Column(String, default="Pending")
    expiry_date = Column(String)
    auto_payment = Column(Boolean, default=False)
    payment_method = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="insurance_policies")
    customer_claims = relationship("CustomerClaim", back_populates="policy")
    payment_records = relationship("PaymentRecord", back_populates="policy")


class PaymentRecord(Base):
    """Every premium payment made by a customer for a policy."""
    __tablename__ = "payment_records"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    policy_id = Column(String, ForeignKey("insurance_policies.id"))
    policy_number = Column(String, nullable=True)
    policy_name = Column(String, nullable=True)
    amount = Column(Float, default=0.0)
    payment_method = Column(String, nullable=True)   # UPI, Card, Net Banking, etc.
    transaction_id = Column(String, nullable=True)
    status = Column(String, default="success")        # success | failed | pending
    payment_type = Column(String, default="premium")  # premium | claim_settlement | refund
    month_number = Column(Integer, nullable=True)     # which month of the policy (1, 2, 3…)
    notes = Column(String, nullable=True)
    paid_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="payment_records")
    policy = relationship("InsurancePolicy", back_populates="payment_records")


class CustomerClaim(Base):
    """Claims submitted by customers through the customer portal."""
    __tablename__ = "customer_claims"
    id = Column(String, primary_key=True, index=True)
    policy_id = Column(String, ForeignKey("insurance_policies.id"))
    user_id = Column(String, ForeignKey("users.id"))
    description = Column(String, nullable=True)
    amount = Column(Float, default=0.0)
    status = Column(String, default="Submitted")
    progress = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    settled_amount = Column(Float, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="customer_claims")
    policy = relationship("InsurancePolicy", back_populates="customer_claims")


# ─────────────────────────────────────────────
#  CUSTOMER-SUPPORT TABLES
# ─────────────────────────────────────────────
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
    agent_id_8 = Column(String, unique=True, index=True, nullable=True) # 8-digit random ID
    manager_id = Column(String, nullable=True)
    user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class SupportClaim(Base):
    """Claims managed by the support team (field assignment workflow)."""
    __tablename__ = "support_claims"
    id = Column(String, primary_key=True, index=True)
    # Link back to customer claim if originated from portal
    customer_claim_id = Column(String, ForeignKey("customer_claims.id"), nullable=True)
    customer_user_id = Column(String, ForeignKey("users.id"), nullable=True)
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
    is_verified = Column(Boolean, default=False)
    settled_amount = Column(Float, nullable=True)
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
    specializations = Column(String, nullable=True)
    beds = Column(Integer, nullable=True)
    empanelled = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)
    hospital_id_8 = Column(String, unique=True, index=True, nullable=True) # 8-digit random ID
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


# ─────────────────────────────────────────────
#  INSURE-AGENT TABLES
# ─────────────────────────────────────────────
class AgentProfile(Base):
    """Extended profile for insure-agents (field agents)."""
    __tablename__ = "agent_profiles"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, index=True)
    full_name = Column(String)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_online = Column(Boolean, default=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    city = Column(String, nullable=True)
    district = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AgentBankDetail(Base):
    """Bank/payment details for insure-agents."""
    __tablename__ = "agent_bank_details"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, index=True)
    bank_name = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    ifsc_code = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AgentClaim(Base):
    """Claims assigned to field agents via the insure-agent app."""
    __tablename__ = "agent_claims"
    id = Column(String, primary_key=True, index=True)
    claim_number = Column(String, unique=True, index=True)
    claim_type = Column(String)
    priority = Column(String)
    status = Column(String, default="assigned")
    customer_name = Column(String)
    customer_phone = Column(String, nullable=True)
    policy_number = Column(String, nullable=True)
    incident_description = Column(String, nullable=True)
    claim_amount = Column(Float, default=0.0)
    location_address = Column(String, nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    district = Column(String, nullable=True)
    assigned_agent_id = Column(String, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AgentClaimDocument(Base):
    """Documents uploaded by agents for their claims."""
    __tablename__ = "agent_claim_documents"
    id = Column(String, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("agent_claims.id"))
    agent_id = Column(String, ForeignKey("users.id"))
    file_name = Column(String)
    file_url = Column(String, nullable=True)   # stored path or URL
    document_type = Column(String, nullable=True)  # photo, pdf, etc.
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────
#  SHARED MESSAGING (support ↔ agent / support ↔ hospital)
# ─────────────────────────────────────────────
class Message(Base):
    """Real-time messages between support staff and agents/hospitals."""
    __tablename__ = "messages"
    id = Column(String, primary_key=True, index=True)
    # Participants
    sender_id = Column(String, ForeignKey("users.id"))
    receiver_id = Column(String, ForeignKey("users.id"))
    sender_role = Column(String)    # manager | agent | hospital
    receiver_role = Column(String)
    content = Column(String)
    file_url = Column(String, nullable=True)   # shared file
    file_name = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────
#  HOSPITAL CLAIM FORM TABLES (from hospital claim form project)
# ─────────────────────────────────────────────
class HospitalUser(Base):
    """Hospital portal users (separate from customer/staff users)."""
    __tablename__ = "hospital_users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class HospitalProfile(Base):
    """Hospital profile linked to a hospital user."""
    __tablename__ = "hospital_profiles"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    hospital_name = Column(String)
    email = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    bed_capacity = Column(Integer, nullable=True)
    hospital_id_8 = Column(String, unique=True, index=True, nullable=True) # 8-digit random ID
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class InsuranceCompany(Base):
    __tablename__ = "insurance_companies"
    id = Column(String, primary_key=True, index=True)
    company_name = Column(String)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class MediPolicy(Base):
    """Insurance policies for hospital claims."""
    __tablename__ = "medi_policies"
    id = Column(String, primary_key=True, index=True)
    policy_number = Column(String, unique=True, index=True)
    customer_name = Column(String)
    aadhaar_number = Column(String, nullable=True)
    pan_number = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    company_id = Column(String, ForeignKey("insurance_companies.id"), nullable=True)
    policy_type = Column(String, default="individual")
    coverage_amount = Column(Float, default=0.0)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    status = Column(String, default="active")
    corporate_company_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class HospitalClaim(Base):
    """Claims submitted by hospitals through the hospital claim form."""
    __tablename__ = "hospital_claims"
    id = Column(String, primary_key=True, index=True)
    claim_number = Column(String, unique=True, index=True)
    hospital_user_id = Column(String, ForeignKey("users.id"))
    policy_id = Column(String, ForeignKey("medi_policies.id"), nullable=True)
    claim_status = Column(String, default="initiated")
    diagnosis = Column(String, nullable=True)
    treatment_details = Column(String, nullable=True)
    doctor_name = Column(String, nullable=True)
    admission_date = Column(String, nullable=True)
    discharge_date = Column(String, nullable=True)
    estimated_amount = Column(Float, default=0.0)
    approved_amount = Column(Float, default=0.0)
    remarks = Column(String, nullable=True)
    # Patient details (denormalized for simplicity)
    patient_name = Column(String, nullable=True)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String, nullable=True)
    is_corporate = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class HospitalClaimDocument(Base):
    """Documents uploaded for hospital claims."""
    __tablename__ = "hospital_claim_documents"
    id = Column(String, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("hospital_claims.id"))
    document_type = Column(String)
    file_path = Column(String)
    file_name = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)


class HospitalSupportTicket(Base):
    """Support tickets from hospitals."""
    __tablename__ = "hospital_support_tickets"
    id = Column(String, primary_key=True, index=True)
    hospital_user_id = Column(String, ForeignKey("hospital_users.id"))
    subject = Column(String)
    issue = Column(String)
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class HospitalSupportMessage(Base):
    """Messages in hospital support tickets."""
    __tablename__ = "hospital_support_messages"
    id = Column(String, primary_key=True, index=True)
    ticket_id = Column(String, ForeignKey("hospital_support_tickets.id"))
    sender_id = Column(String)
    sender_role = Column(String)
    message = Column(String)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
