from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from models import User, Agent, Claim, ClaimDocument, ClaimNote, Message, Notification, Analytics
from schemas import (
    UserCreate, UserUpdate, AgentCreate, AgentUpdate, ClaimCreate, ClaimUpdate,
    ClaimDocumentCreate, ClaimNoteCreate, MessageCreate, NotificationCreate
)
from utils import get_password_hash, verify_password


# User CRUD Operations
def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user: UserCreate):
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        role=user.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db_user.updated_at = datetime.utcnow()
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user


# Agent CRUD Operations
def get_agent(db: Session, agent_id: int):
    return db.query(Agent).filter(Agent.id == agent_id).first()


def get_agent_by_user(db: Session, user_id: int):
    return db.query(Agent).filter(Agent.user_id == user_id).first()


def get_agents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Agent).offset(skip).limit(limit).all()


def create_agent(db: Session, agent: AgentCreate):
    db_agent = Agent(**agent.model_dump())
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent


def update_agent(db: Session, agent_id: int, agent_update: AgentUpdate):
    db_agent = get_agent(db, agent_id)
    if db_agent:
        update_data = agent_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_agent, key, value)
        db_agent.updated_at = datetime.utcnow()
        db.add(db_agent)
        db.commit()
        db.refresh(db_agent)
    return db_agent


# Claim CRUD Operations
def get_claim(db: Session, claim_id: int):
    return db.query(Claim).filter(Claim.id == claim_id).first()


def get_claim_by_number(db: Session, claim_number: str):
    return db.query(Claim).filter(Claim.claim_number == claim_number).first()


def get_claims(db: Session, skip: int = 0, limit: int = 100, status: str = None):
    query = db.query(Claim)
    if status:
        query = query.filter(Claim.status == status)
    return query.order_by(desc(Claim.created_at)).offset(skip).limit(limit).all()


def get_agent_claims(db: Session, agent_id: int, skip: int = 0, limit: int = 100):
    return db.query(Claim).filter(Claim.assigned_agent_id == agent_id).offset(skip).limit(limit).all()


def create_claim(db: Session, claim: ClaimCreate):
    # Generate claim number
    claim_count = db.query(Claim).count()
    claim_number = f"CLM-{datetime.utcnow().year}-{claim_count + 1:05d}"
    
    db_claim = Claim(
        claim_number=claim_number,
        **claim.model_dump()
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim


def update_claim(db: Session, claim_id: int, claim_update: ClaimUpdate):
    db_claim = get_claim(db, claim_id)
    if db_claim:
        update_data = claim_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_claim, key, value)
        db_claim.updated_at = datetime.utcnow()
        db.add(db_claim)
        db.commit()
        db.refresh(db_claim)
    return db_claim


# Claim Document CRUD Operations
def create_claim_document(db: Session, claim_id: int, document: ClaimDocumentCreate):
    db_document = ClaimDocument(claim_id=claim_id, **document.model_dump())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


def get_claim_documents(db: Session, claim_id: int):
    return db.query(ClaimDocument).filter(ClaimDocument.claim_id == claim_id).all()


# Claim Note CRUD Operations
def create_claim_note(db: Session, claim_id: int, note: ClaimNoteCreate, agent_id: int = None):
    db_note = ClaimNote(claim_id=claim_id, agent_id=agent_id, **note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def get_claim_notes(db: Session, claim_id: int):
    return db.query(ClaimNote).filter(ClaimNote.claim_id == claim_id).all()


# Message CRUD Operations
def create_message(db: Session, sender_id: int, message: MessageCreate):
    db_message = Message(sender_id=sender_id, **message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_messages(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Message).filter(
        (Message.sender_id == user_id) | (Message.recipient_id == user_id)
    ).offset(skip).limit(limit).all()


# Notification CRUD Operations
def create_notification(db: Session, notification: NotificationCreate):
    db_notification = Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Notification).filter(Notification.user_id == user_id).offset(skip).limit(limit).all()


def mark_notification_as_read(db: Session, notification_id: int):
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if db_notification:
        db_notification.is_read = True
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
    return db_notification


# Analytics CRUD Operations
def get_analytics(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Analytics).order_by(desc(Analytics.created_at)).offset(skip).limit(limit).all()


def get_agent_analytics(db: Session, agent_id: int):
    return db.query(Analytics).filter(Analytics.agent_id == agent_id).all()
