from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from database import get_db, init_db
import crud
import schemas
from utils import verify_password, create_access_token, verify_token
from models import User, Agent, Claim, UserRole

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="Agent Command Center API",
    description="API for managing insurance claims and agents",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication Dependencies
def get_current_user(token: str = None, db: Session = Depends(get_db)):
    """Get current authenticated user from token"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = crud.get_user(db, payload.get("sub"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


# Auth Routes
@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    return crud.create_user(db=db, user=user)


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    user = crud.get_user_by_username(db, username=credentials.username)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


# User Routes
@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_users(db, skip=skip, limit=limit)


@app.get("/api/users/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID"""
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/api/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user"""
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = crud.update_user(db, user_id=user_id, user_update=user_update)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Agent Routes
@app.get("/api/agents", response_model=List[schemas.AgentWithUserResponse])
def get_agents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all agents"""
    return crud.get_agents(db, skip=skip, limit=limit)


@app.get("/api/agents/{agent_id}", response_model=schemas.AgentWithUserResponse)
def get_agent(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get agent by ID"""
    agent = crud.get_agent(db, agent_id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@app.post("/api/agents", response_model=schemas.AgentResponse)
def create_agent(
    agent: schemas.AgentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new agent"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.create_agent(db=db, agent=agent)


@app.put("/api/agents/{agent_id}", response_model=schemas.AgentResponse)
def update_agent(
    agent_id: int,
    agent_update: schemas.AgentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update agent"""
    agent = crud.get_agent(db, agent_id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if current_user.id != agent.user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud.update_agent(db, agent_id=agent_id, agent_update=agent_update)


# Claim Routes
@app.get("/api/claims", response_model=List[schemas.ClaimResponse])
def get_claims(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all claims"""
    return crud.get_claims(db, skip=skip, limit=limit, status=status)


@app.get("/api/claims/{claim_id}", response_model=schemas.ClaimDetailResponse)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get claim by ID"""
    claim = crud.get_claim(db, claim_id=claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@app.post("/api/claims", response_model=schemas.ClaimResponse)
def create_claim(
    claim: schemas.ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new claim"""
    return crud.create_claim(db=db, claim=claim)


@app.put("/api/claims/{claim_id}", response_model=schemas.ClaimResponse)
def update_claim(
    claim_id: int,
    claim_update: schemas.ClaimUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update claim"""
    claim = crud.get_claim(db, claim_id=claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud.update_claim(db, claim_id=claim_id, claim_update=claim_update)


@app.get("/api/agents/{agent_id}/claims", response_model=List[schemas.ClaimResponse])
def get_agent_claims(
    agent_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get claims assigned to an agent"""
    return crud.get_agent_claims(db, agent_id=agent_id, skip=skip, limit=limit)


# Claim Document Routes
@app.post("/api/claims/{claim_id}/documents", response_model=schemas.ClaimDocumentResponse)
def upload_document(
    claim_id: int,
    document: schemas.ClaimDocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload document for claim"""
    return crud.create_claim_document(db, claim_id=claim_id, document=document)


@app.get("/api/claims/{claim_id}/documents", response_model=List[schemas.ClaimDocumentResponse])
def get_documents(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get documents for claim"""
    return crud.get_claim_documents(db, claim_id=claim_id)


# Claim Note Routes
@app.post("/api/claims/{claim_id}/notes", response_model=schemas.ClaimNoteResponse)
def add_claim_note(
    claim_id: int,
    note: schemas.ClaimNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add note to claim"""
    agent = crud.get_agent_by_user(db, current_user.id)
    return crud.create_claim_note(db, claim_id=claim_id, note=note, agent_id=agent.id if agent else None)


@app.get("/api/claims/{claim_id}/notes", response_model=List[schemas.ClaimNoteResponse])
def get_claim_notes(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notes for claim"""
    return crud.get_claim_notes(db, claim_id=claim_id)


# Message Routes
@app.post("/api/messages", response_model=schemas.MessageResponse)
def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send message"""
    return crud.create_message(db, sender_id=current_user.id, message=message)


@app.get("/api/messages", response_model=List[schemas.MessageResponse])
def get_user_messages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get messages for current user"""
    return crud.get_messages(db, user_id=current_user.id, skip=skip, limit=limit)


# Notification Routes
@app.post("/api/notifications", response_model=schemas.NotificationResponse)
def create_notification(
    notification: schemas.NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create notification (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.create_notification(db=db, notification=notification)


@app.get("/api/notifications", response_model=List[schemas.NotificationResponse])
def get_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for current user"""
    return crud.get_user_notifications(db, user_id=current_user.id, skip=skip, limit=limit)


@app.put("/api/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark notification as read"""
    return crud.mark_notification_as_read(db, notification_id=notification_id)


# Analytics Routes
@app.get("/api/analytics", response_model=List[schemas.AnalyticsResponse])
def get_analytics(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analytics"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_analytics(db, skip=skip, limit=limit)


# Health check
@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
