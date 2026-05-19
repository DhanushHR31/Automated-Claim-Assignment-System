import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Date, DateTime,
    ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum


def gen_uuid():
    return str(uuid.uuid4())


class PolicyType(str, enum.Enum):
    individual = "individual"
    corporate = "corporate"


class PolicyStatus(str, enum.Enum):
    active = "active"
    expired = "expired"


class ClaimStatus(str, enum.Enum):
    initiated = "initiated"
    pending_approval = "pending_approval"
    approved = "approved"
    rejected = "rejected"
    under_verification = "under_verification"
    paid = "paid"


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"


class TicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    closed = "closed"


class DocumentType(str, enum.Enum):
    aadhaar = "aadhaar"
    pan = "pan"
    insurance_doc = "insurance_doc"
    admission_doc = "admission_doc"
    diagnosis_report = "diagnosis_report"
    discharge_summary = "discharge_summary"
    final_bill = "final_bill"
    pharmacy_bill = "pharmacy_bill"
    company_id = "company_id"


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    hospital = relationship("Hospital", back_populates="user", uselist=False)


class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    hospital_name = Column(String, nullable=False)
    email = Column(String)
    contact_number = Column(String)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    license_number = Column(String)
    specialization = Column(String)
    bed_capacity = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="hospital")
    claims = relationship("Claim", back_populates="hospital")
    support_tickets = relationship("SupportTicket", back_populates="hospital")


class InsuranceCompany(Base):
    __tablename__ = "insurance_companies"
    id = Column(String, primary_key=True, default=gen_uuid)
    company_name = Column(String, nullable=False)
    contact_email = Column(String)
    contact_phone = Column(String)
    address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    policies = relationship("Policy", back_populates="insurance_company")
    claim_approvals = relationship("ClaimApproval", back_populates="company")


class Policy(Base):
    __tablename__ = "policies"
    id = Column(String, primary_key=True, default=gen_uuid)
    policy_number = Column(String, unique=True, nullable=False, index=True)
    customer_name = Column(String, nullable=False)
    aadhaar_number = Column(String)
    pan_number = Column(String)
    contact_number = Column(String)
    email = Column(String)
    company_id = Column(String, ForeignKey("insurance_companies.id"), nullable=False)
    policy_type = Column(SAEnum(PolicyType), default=PolicyType.individual)
    coverage_amount = Column(Float, default=0)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(SAEnum(PolicyStatus), default=PolicyStatus.active)
    corporate_company_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    insurance_company = relationship("InsuranceCompany", back_populates="policies")
    claims = relationship("Claim", back_populates="policy")


class Claim(Base):
    __tablename__ = "claims"
    id = Column(String, primary_key=True, default=gen_uuid)
    claim_number = Column(String, unique=True, nullable=False, index=True)
    hospital_id = Column(String, ForeignKey("hospitals.id"), nullable=False)
    policy_id = Column(String, ForeignKey("policies.id"), nullable=False)
    claim_status = Column(SAEnum(ClaimStatus), default=ClaimStatus.initiated)
    diagnosis = Column(String)
    treatment_details = Column(Text)
    doctor_name = Column(String)
    admission_date = Column(Date)
    discharge_date = Column(Date)
    estimated_amount = Column(Float, default=0)
    approved_amount = Column(Float, default=0)
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    hospital = relationship("Hospital", back_populates="claims")
    policy = relationship("Policy", back_populates="claims")
    patient_details = relationship("ClaimPatientDetail", back_populates="claim", uselist=False)
    documents = relationship("ClaimDocument", back_populates="claim")
    approvals = relationship("ClaimApproval", back_populates="claim")
    billing = relationship("ClaimBilling", back_populates="claim")
    payments = relationship("ClaimPayment", back_populates="claim")


class ClaimPatientDetail(Base):
    __tablename__ = "claim_patient_details"
    id = Column(String, primary_key=True, default=gen_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False)
    patient_name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    aadhaar = Column(String)
    pan = Column(String)
    contact = Column(String)
    email = Column(String)
    relation_to_holder = Column(String)
    is_corporate = Column(Boolean, default=False)
    employee_id = Column(String)
    claim = relationship("Claim", back_populates="patient_details")


class ClaimDocument(Base):
    __tablename__ = "claim_documents"
    id = Column(String, primary_key=True, default=gen_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False)
    document_type = Column(SAEnum(DocumentType), nullable=False)
    file_path = Column(String, nullable=False)
    file_name = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    claim = relationship("Claim", back_populates="documents")


class ClaimApproval(Base):
    __tablename__ = "claim_approvals"
    id = Column(String, primary_key=True, default=gen_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False)
    company_id = Column(String, ForeignKey("insurance_companies.id"), nullable=False)
    approval_status = Column(SAEnum(ApprovalStatus), default=ApprovalStatus.pending)
    remarks = Column(Text)
    decided_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    claim = relationship("Claim", back_populates="approvals")
    company = relationship("InsuranceCompany", back_populates="claim_approvals")


class ClaimBilling(Base):
    __tablename__ = "claim_billing"
    id = Column(String, primary_key=True, default=gen_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False)
    total_bill = Column(Float, default=0)
    pharmacy_bill = Column(Float)
    discharge_summary_url = Column(String)
    final_bill_url = Column(String)
    notes = Column(Text)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    claim = relationship("Claim", back_populates="billing")


class ClaimPayment(Base):
    __tablename__ = "claim_payments"
    id = Column(String, primary_key=True, default=gen_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False)
    amount_paid = Column(Float, default=0)
    payment_date = Column(Date)
    transaction_id = Column(String)
    payment_status = Column(SAEnum(PaymentStatus), default=PaymentStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    claim = relationship("Claim", back_populates="payments")


class SupportTicket(Base):
    __tablename__ = "support_tickets"
    id = Column(String, primary_key=True, default=gen_uuid)
    hospital_id = Column(String, ForeignKey("hospitals.id"), nullable=False)
    subject = Column(String, nullable=False)
    issue = Column(Text, nullable=False)
    status = Column(SAEnum(TicketStatus), default=TicketStatus.open)
    created_at = Column(DateTime, default=datetime.utcnow)
    hospital = relationship("Hospital", back_populates="support_tickets")
    messages = relationship("SupportMessage", back_populates="ticket")


class SupportMessage(Base):
    __tablename__ = "support_messages"
    id = Column(String, primary_key=True, default=gen_uuid)
    ticket_id = Column(String, ForeignKey("support_tickets.id"), nullable=False)
    sender_id = Column(String, nullable=False)
    sender_role = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    ticket = relationship("SupportTicket", back_populates="messages")
