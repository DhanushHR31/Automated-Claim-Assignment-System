from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext

import models, schemas
from database import engine, get_db

# Security Configuration
SECRET_KEY = "your-secret-key-for-jwt-keep-it-safe"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Insure Agent API - Full Stack")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.get("/")
def read_root():
    return {"message": "Insure Agent Backend with Local Auth is running"}

# Auth Endpoints
@app.post("/register", response_model=schemas.User)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_pw = get_password_hash(user_in.password)
    db_user = models.User(
        id=user_id,
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(db_user)
    
    # Also create a profile
    db_profile = models.Profile(
        id=str(uuid.uuid4()),
        user_id=user_id,
        full_name=user_in.full_name,
        email=user_in.email,
        phone=""
    )
    db.add(db_profile)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/me", response_model=schemas.User)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

# Profile Endpoints
@app.get("/profiles/{user_id}", response_model=schemas.Profile)
def get_profile(user_id: str, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.put("/profiles/{user_id}", response_model=schemas.Profile)
def update_profile(user_id: str, profile_update: schemas.ProfileBase, db: Session = Depends(get_db)):
    db_profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile_update.dict(exclude_unset=True).items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

# Payment Detail Endpoints
@app.get("/payment-details/{user_id}", response_model=schemas.PaymentDetail)
def get_payment_details(user_id: str, db: Session = Depends(get_db)):
    details = db.query(models.AgentPaymentDetail).filter(models.AgentPaymentDetail.user_id == user_id).first()
    if not details:
        # Create default empty details if not found
        details = models.AgentPaymentDetail(id=str(uuid.uuid4()), user_id=user_id)
        db.add(details)
        db.commit()
        db.refresh(details)
    return details

@app.put("/payment-details/{user_id}", response_model=schemas.PaymentDetail)
def update_payment_details(user_id: str, details_update: schemas.PaymentDetailBase, db: Session = Depends(get_db)):
    db_details = db.query(models.AgentPaymentDetail).filter(models.AgentPaymentDetail.user_id == user_id).first()
    if not db_details:
        db_details = models.AgentPaymentDetail(id=str(uuid.uuid4()), user_id=user_id)
        db.add(db_details)
    
    for key, value in details_update.dict(exclude_unset=True).items():
        setattr(db_details, key, value)
    
    db.commit()
    db.refresh(db_details)
    return db_details

# Claim Endpoints
@app.get("/claims", response_model=List[schemas.Claim])
def get_claims(agent_id: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Claim)
    if agent_id:
        query = query.filter(models.Claim.assigned_agent_id == agent_id)
    return query.order_by(models.Claim.created_at.desc()).all()

@app.get("/claims/queue", response_model=List[schemas.Claim])
def get_claim_queue(db: Session = Depends(get_db)):
    return db.query(models.Claim).filter(models.Claim.status == "assigned", models.Claim.assigned_agent_id == None).all()

@app.patch("/claims/{claim_id}", response_model=schemas.Claim)
def update_claim(claim_id: str, updates: dict, db: Session = Depends(get_db)):
    db_claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not db_claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    for key, value in updates.items():
        if hasattr(db_claim, key):
            if key in ["accepted_at", "completed_at", "assigned_at"] and value:
                try:
                    value = datetime.fromisoformat(value.replace("Z", "+00:00"))
                except:
                    pass
            setattr(db_claim, key, value)
    
    db.commit()
    db.refresh(db_claim)
    return db_claim
