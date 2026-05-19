"""
Shared Backend — serves both Customer Portal (port 8000) and Customer-Support (port 8000).
Single SQLite database: insurance.db
"""

from fastapi import FastAPI, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import os
import random
import string

from passlib.context import CryptContext
from jose import JWTError, jwt

import models, schemas
from database import engine, get_db

# ─── Bootstrap DB ────────────────────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)

# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(title="Insurance Platform — Shared API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if not exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── Security ────────────────────────────────────────────────────────────────
SECRET_KEY = "insurance-platform-shared-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def require_staff(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Only managers/agents can access customer-support endpoints."""
    if current_user.role not in ("manager", "agent"):
        raise HTTPException(status_code=403, detail="Staff access required")
    return current_user

def next_agent_code(db: Session) -> str:
    count = db.query(models.Agent).count() + 1
    code = f"AGT-{count:04d}"
    while db.query(models.Agent).filter(models.Agent.agent_code == code).first():
        count += 1
        code = f"AGT-{count:04d}"
    return code
    
def generate_random_8_digit_id(db: Session, model, field_name: str) -> str:
    while True:
        new_id = "".join(random.choices(string.digits, k=8))
        # Ensure it's unique
        exists = db.query(model).filter(getattr(model, field_name) == new_id).first()
        if not exists:
            return new_id

def ensure_agent_records(db: Session, user: models.User, phone: Optional[str] = None) -> models.Agent:
    profile = db.query(models.AgentProfile).filter(models.AgentProfile.user_id == user.id).first()
    if not profile:
        profile = models.AgentProfile(
            id=str(uuid.uuid4()),
            user_id=user.id,
            full_name=user.full_name or user.email.split("@")[0],
            phone=phone or "",
            email=user.email,
            is_online=True,
            city="Bengaluru",
            district="Bengaluru Urban",
            current_lat=12.9716,
            current_lng=77.5946,
        )
        db.add(profile)
    elif phone and not profile.phone:
        profile.phone = phone

    agent = db.query(models.Agent).filter(models.Agent.user_id == user.id).first()
    if not agent:
        agent = models.Agent(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name=user.full_name or user.email.split("@")[0],
            phone=phone or (profile.phone if profile else ""),
            email=user.email,
            home_city=profile.city or "Bengaluru",
            home_state="Karnataka",
            latitude=profile.current_lat or 12.9716,
            longitude=profile.current_lng or 77.5946,
            availability="available",
            working_hours_start="07:00",
            working_hours_end="17:00",
            travel_allowed=True,
            performance_score=90,
            active_claims=0,
            agent_code=next_agent_code(db),
            agent_id_8=generate_random_8_digit_id(db, models.Agent, "agent_id_8"),
        )
        db.add(agent)
    else:
        agent.name = user.full_name or agent.name
        agent.email = user.email
        if phone:
            agent.phone = phone
    return agent

def serialize_agent_profile(db: Session, user: models.User) -> dict:
    agent = ensure_agent_records(db, user)
    profile = db.query(models.AgentProfile).filter(models.AgentProfile.user_id == user.id).first()
    db.commit()
    db.refresh(agent)
    if profile:
        db.refresh(profile)
    return {
        "id": profile.id if profile else agent.id,
        "user_id": user.id,
        "full_name": profile.full_name if profile else agent.name,
        "phone": profile.phone if profile else agent.phone,
        "email": profile.email if profile else agent.email,
        "avatar_url": profile.avatar_url if profile else None,
        "is_online": profile.is_online if profile else True,
        "current_lat": profile.current_lat if profile else agent.latitude,
        "current_lng": profile.current_lng if profile else agent.longitude,
        "city": profile.city if profile else agent.home_city,
        "district": profile.district if profile else agent.home_city,
        "agent_id": agent.id,
        "agent_code": agent.agent_code,
        "availability": agent.availability,
        "performance_score": agent.performance_score,
        "active_claims": agent.active_claims,
        "travel_allowed": agent.travel_allowed,
        "working_hours_start": agent.working_hours_start,
        "working_hours_end": agent.working_hours_end,
    }

def support_claim_to_agent_claim(db: Session, claim: models.SupportClaim, agent_user_id: Optional[str] = None) -> dict:
    customer_name = "Customer"
    customer_phone = ""
    policy_number = claim.claim_code or "N/A"
    if claim.customer_user_id:
        customer = db.query(models.User).filter(models.User.id == claim.customer_user_id).first()
        profile = db.query(models.Profile).filter(models.Profile.user_id == claim.customer_user_id).first()
        if customer:
            customer_name = customer.full_name or customer.email
        if profile:
            customer_name = profile.full_name or customer_name
            customer_phone = profile.phone or ""
    agent = db.query(models.Agent).filter(models.Agent.id == claim.assigned_agent_id).first() if claim.assigned_agent_id else None
    return {
        "id": claim.id,
        "claim_number": claim.claim_code or claim.id,
        "claim_type": claim.claim_type,
        "priority": claim.urgency,
        "status": claim.status,
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "policy_number": policy_number,
        "incident_description": claim.description,
        "claim_amount": claim.estimated_value,
        "location_address": claim.address,
        "location_lat": claim.latitude,
        "location_lng": claim.longitude,
        "district": claim.city,
        "assigned_agent_id": agent.user_id if agent else agent_user_id,
        "assigned_at": claim.updated_at,
        "accepted_at": None,
        "completed_at": claim.updated_at if claim.status == "completed" else None,
        "created_at": claim.created_at,
        "updated_at": claim.updated_at,
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  ROOT
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/")
def root():
    return {"message": "Insurance Platform Shared API v2.0 is running"}


# ═══════════════════════════════════════════════════════════════════════════════
#  AUTH — CUSTOMER PORTAL  (JSON body login)
# ═══════════════════════════════════════════════════════════════════════════════
@app.post("/register", response_model=schemas.Token, tags=["Customer Auth"])
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    role = user.role if user.role else "customer"
    user_id = str(uuid.uuid4())
    
    new_user = models.User(
        id=user_id,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        role=role,
        custom_id=generate_random_8_digit_id(db, models.User, "custom_id"),
    )
    db.add(new_user)
    
    # Initialize profile based on role
    if role == "customer":
        db.add(models.Profile(id=str(uuid.uuid4()), user_id=user_id))
    elif role == "hospital":
        # Create a HospitalProfile for the MediClaim frontend
        db.add(models.HospitalProfile(
            id=str(uuid.uuid4()), 
            user_id=user_id, # Using the main User table for auth
            hospital_name=user.full_name or "New Hospital",
            email=user.email,
            hospital_id_8=generate_random_8_digit_id(db, models.HospitalProfile, "hospital_id_8")
        ))
    elif role == "agent":
        ensure_agent_records(db, new_user, user.phone)
        
    db.commit()
    db.refresh(new_user)
    token = create_access_token({"sub": new_user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": new_user.id, "email": new_user.email}}


@app.post("/login", response_model=schemas.Token, tags=["Customer Auth"])
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": db_user.id, "email": db_user.email}}


@app.get("/me", tags=["Customer Auth"])
def me(current_user: models.User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "role": current_user.role, "full_name": current_user.full_name}


# ═══════════════════════════════════════════════════════════════════════════════
#  AUTH — CUSTOMER-SUPPORT  (OAuth2 form-based login for manager/agent)
# ═══════════════════════════════════════════════════════════════════════════════
@app.post("/staff/register", response_model=schemas.Token, tags=["Staff Auth"])
def staff_register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    role = user.role if user.role in ("manager", "agent") else "manager"
    user_id = str(uuid.uuid4())
    new_user = models.User(
        id=user_id,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name or "",
        role=role,
        custom_id=generate_random_8_digit_id(db, models.User, "custom_id"),
    )
    db.add(new_user)
    if role == "agent":
        ensure_agent_records(db, new_user, user.phone)
    db.commit()
    db.refresh(new_user)
    token = create_access_token({"sub": new_user.email})
    return {"access_token": token, "token_type": "bearer",
            "user": {"id": new_user.id, "email": new_user.email, "full_name": new_user.full_name, "role": new_user.role, "is_active": new_user.is_active, "created_at": str(new_user.created_at)}}


@app.post("/token", tags=["Staff Auth"])
def staff_login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 form-based login used by customer-support manager login page."""
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if db_user.role not in ("manager", "agent"):
        raise HTTPException(status_code=403, detail="Staff account required")
    token = create_access_token({"sub": db_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "role": db_user.role,
            "is_active": db_user.is_active,
            "created_at": str(db_user.created_at),
        },
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER PORTAL — Profile
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/profiles", response_model=schemas.Profile, tags=["Customer Portal"])
def get_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(id=str(uuid.uuid4()), user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@app.patch("/profiles", response_model=schemas.Profile, tags=["Customer Portal"])
def update_profile(updates: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(id=str(uuid.uuid4()), user_id=current_user.id)
        db.add(profile)
    for k, v in updates.items():
        if hasattr(profile, k):
            setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER PORTAL — KYC
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/profiles/{user_id}", tags=["Insure Agent"])
def get_agent_profile(user_id: str, db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.role == "agent").first()
    if not user:
        raise HTTPException(status_code=404, detail="Agent profile not found")
    return serialize_agent_profile(db, user)

@app.put("/profiles/{user_id}", tags=["Insure Agent"])
def update_agent_profile(user_id: str, updates: dict, db: Session = Depends(get_db), current_user: models.User = Depends(require_staff)):
    if current_user.role == "agent" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Agents can only update their own profile")
    user = db.query(models.User).filter(models.User.id == user_id, models.User.role == "agent").first()
    if not user:
        raise HTTPException(status_code=404, detail="Agent profile not found")
    ensure_agent_records(db, user)
    profile = db.query(models.AgentProfile).filter(models.AgentProfile.user_id == user_id).first()
    agent = db.query(models.Agent).filter(models.Agent.user_id == user_id).first()
    allowed_profile = {"full_name", "phone", "email", "avatar_url", "is_online", "current_lat", "current_lng", "city", "district"}
    for key, value in updates.items():
        if key in allowed_profile and hasattr(profile, key):
            setattr(profile, key, value)
    if profile and agent:
        agent.name = profile.full_name or agent.name
        agent.phone = profile.phone or agent.phone
        agent.email = profile.email or agent.email
        agent.home_city = profile.city or agent.home_city
        agent.latitude = profile.current_lat or agent.latitude
        agent.longitude = profile.current_lng or agent.longitude
    db.commit()
    return serialize_agent_profile(db, user)

@app.get("/payment-details/{user_id}", tags=["Insure Agent"])
def get_agent_payment_details(user_id: str, db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    details = db.query(models.AgentBankDetail).filter(models.AgentBankDetail.user_id == user_id).first()
    if not details:
        details = models.AgentBankDetail(id=str(uuid.uuid4()), user_id=user_id)
        db.add(details)
        db.commit()
        db.refresh(details)
    return {
        "id": details.id,
        "user_id": details.user_id,
        "bank_name": details.bank_name,
        "account_number": details.account_number,
        "ifsc_code": details.ifsc_code,
        "created_at": details.created_at,
    }

@app.put("/payment-details/{user_id}", tags=["Insure Agent"])
def update_agent_payment_details(user_id: str, updates: dict, db: Session = Depends(get_db), current_user: models.User = Depends(require_staff)):
    if current_user.role == "agent" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Agents can only update their own payment details")
    details = db.query(models.AgentBankDetail).filter(models.AgentBankDetail.user_id == user_id).first()
    if not details:
        details = models.AgentBankDetail(id=str(uuid.uuid4()), user_id=user_id)
        db.add(details)
    for key in ("bank_name", "account_number", "ifsc_code"):
        if key in updates:
            setattr(details, key, updates[key])
    db.commit()
    db.refresh(details)
    return {
        "id": details.id,
        "user_id": details.user_id,
        "bank_name": details.bank_name,
        "account_number": details.account_number,
        "ifsc_code": details.ifsc_code,
        "created_at": details.created_at,
    }

@app.get("/kyc_documents", response_model=List[schemas.KYCDocument], tags=["Customer Portal"])
def get_kyc(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.KYCDocument).filter(models.KYCDocument.user_id == current_user.id).all()


@app.post("/kyc_documents", response_model=schemas.KYCDocument, tags=["Customer Portal"])
def upsert_kyc(doc: schemas.KYCDocumentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    existing = db.query(models.KYCDocument).filter(
        models.KYCDocument.user_id == current_user.id,
        models.KYCDocument.document_type == doc.document_type
    ).first()
    if existing:
        for k, v in doc.dict().items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing
    new_doc = models.KYCDocument(id=str(uuid.uuid4()), user_id=current_user.id, **doc.dict())
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER PORTAL — Insurance Policies
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/insurance_policies", response_model=List[schemas.InsurancePolicy], tags=["Customer Portal"])
def get_policies(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.InsurancePolicy).filter(
        models.InsurancePolicy.user_id == current_user.id
    ).order_by(models.InsurancePolicy.created_at.desc()).all()


@app.get("/insurance_policies/{policy_id}", response_model=schemas.InsurancePolicy, tags=["Customer Portal"])
def get_policy(policy_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.InsurancePolicy).filter(
        models.InsurancePolicy.id == policy_id,
        models.InsurancePolicy.user_id == current_user.id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@app.post("/insurance_policies", response_model=schemas.InsurancePolicy, tags=["Customer Portal"])
def create_policy(policy: schemas.InsurancePolicyCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_policy = models.InsurancePolicy(id=str(uuid.uuid4()), user_id=current_user.id, **policy.dict())
    db.add(new_policy)
    db.flush()  # get the id before commit

    # Auto-record the first premium payment
    first_payment = models.PaymentRecord(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        policy_id=new_policy.id,
        policy_number=new_policy.policy_number,
        policy_name=new_policy.name,
        amount=new_policy.premium,
        payment_method=new_policy.payment_method or "Online",
        transaction_id=f"TXN-{uuid.uuid4().hex[:10].upper()}",
        status="success",
        payment_type="premium",
        month_number=1,
        notes="Initial premium payment on policy purchase",
    )
    db.add(first_payment)
    db.commit()
    db.refresh(new_policy)
    return new_policy


@app.patch("/insurance_policies/{policy_id}", response_model=schemas.InsurancePolicy, tags=["Customer Portal"])
def update_policy(policy_id: str, updates: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.InsurancePolicy).filter(
        models.InsurancePolicy.id == policy_id,
        models.InsurancePolicy.user_id == current_user.id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    for k, v in updates.items():
        if hasattr(policy, k):
            setattr(policy, k, v)
    db.commit()
    db.refresh(policy)
    return policy


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER PORTAL — Customer Claims
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/claims", response_model=List[schemas.CustomerClaim], tags=["Customer Portal"])
def get_customer_claims(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.CustomerClaim).filter(
        models.CustomerClaim.user_id == current_user.id
    ).order_by(models.CustomerClaim.created_at.desc()).all()


@app.post("/claims", response_model=schemas.CustomerClaim, tags=["Customer Portal"])
def create_customer_claim(claim: schemas.CustomerClaimCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_claim = models.CustomerClaim(id=str(uuid.uuid4()), user_id=current_user.id, **claim.dict())
    db.add(new_claim)
    db.flush()

    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    policy = db.query(models.InsurancePolicy).filter(models.InsurancePolicy.id == claim.policy_id).first()
    support_claim = models.SupportClaim(
        id=str(uuid.uuid4()),
        customer_claim_id=new_claim.id,
        customer_user_id=current_user.id,
        address=(profile.address if profile and profile.address else "Customer location pending"),
        city=(profile.city if profile and profile.city else "Bengaluru"),
        state=(profile.state if profile and profile.state else "Karnataka"),
        latitude=12.9716,
        longitude=77.5946,
        claim_type=(policy.type.lower() if policy and policy.type else "health"),
        urgency="medium",
        status="pending",
        description=claim.description or "Customer-submitted insurance claim",
        estimated_value=claim.amount or 0,
        claim_code=f"CLM-{uuid.uuid4().hex[:6].upper()}",
        created_by=current_user.email,
    )
    db.add(support_claim)
    db.commit()
    db.refresh(new_claim)
    return new_claim


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER PORTAL — Payment Records
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/payments", response_model=List[schemas.PaymentRecord], tags=["Customer Portal"])
def get_payments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """All payment records for the logged-in customer."""
    return db.query(models.PaymentRecord).filter(
        models.PaymentRecord.user_id == current_user.id
    ).order_by(models.PaymentRecord.paid_at.desc()).all()


@app.get("/payments/policy/{policy_id}", response_model=List[schemas.PaymentRecord], tags=["Customer Portal"])
def get_payments_by_policy(policy_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Payment records for a specific policy."""
    return db.query(models.PaymentRecord).filter(
        models.PaymentRecord.user_id == current_user.id,
        models.PaymentRecord.policy_id == policy_id,
    ).order_by(models.PaymentRecord.paid_at.asc()).all()


@app.post("/payments", response_model=schemas.PaymentRecord, tags=["Customer Portal"])
def record_payment(payment: schemas.PaymentRecordCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Record a manual premium payment."""
    new_payment = models.PaymentRecord(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        transaction_id=payment.transaction_id or f"TXN-{uuid.uuid4().hex[:10].upper()}",
        **payment.dict(exclude={"transaction_id"}),
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER-SUPPORT — Customer List & Full Detail  (staff only)
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/support/customers", tags=["Customer Support"])
def list_customers(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_staff),
):
    """Return all customers (role=customer) with basic info for the customer list."""
    query = db.query(models.User).filter(models.User.role == "customer")
    if search:
        query = query.filter(
            models.User.email.ilike(f"%{search}%") |
            models.User.full_name.ilike(f"%{search}%")
        )
    users = query.order_by(models.User.created_at.desc()).all()

    result = []
    for u in users:
        profile = db.query(models.Profile).filter(models.Profile.user_id == u.id).first()
        policies = db.query(models.InsurancePolicy).filter(models.InsurancePolicy.user_id == u.id).all()
        claims = db.query(models.CustomerClaim).filter(models.CustomerClaim.user_id == u.id).all()
        result.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name or (profile.full_name if profile else None),
            "phone": profile.phone if profile else None,
            "city": profile.city if profile else None,
            "state": profile.state if profile else None,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "policy_count": len(policies),
            "claim_count": len(claims),
            "custom_id": u.custom_id,
        })
    return result


@app.get("/support/customers/{customer_id}", tags=["Customer Support"])
def get_customer_detail(
    customer_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_staff),
):
    """Full customer detail: profile + KYC + policies + claims."""
    user = db.query(models.User).filter(
        models.User.id == customer_id,
        models.User.role == "customer"
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")

    profile = db.query(models.Profile).filter(models.Profile.user_id == user.id).first()
    kyc_docs = db.query(models.KYCDocument).filter(models.KYCDocument.user_id == user.id).all()
    policies = db.query(models.InsurancePolicy).filter(
        models.InsurancePolicy.user_id == user.id
    ).order_by(models.InsurancePolicy.created_at.desc()).all()
    claims = db.query(models.CustomerClaim).filter(
        models.CustomerClaim.user_id == user.id
    ).order_by(models.CustomerClaim.created_at.desc()).all()
    payments = db.query(models.PaymentRecord).filter(
        models.PaymentRecord.user_id == user.id
    ).order_by(models.PaymentRecord.paid_at.desc()).all()

    # Enrich claims with policy info
    enriched_claims = []
    for c in claims:
        policy = db.query(models.InsurancePolicy).filter(models.InsurancePolicy.id == c.policy_id).first()
        enriched_claims.append({
            "id": c.id,
            "policy_id": c.policy_id,
            "policy_name": policy.name if policy else None,
            "policy_number": policy.policy_number if policy else None,
            "description": c.description,
            "amount": c.amount,
            "status": c.status,
            "progress": c.progress,
            "submitted_at": c.submitted_at,
            "created_at": c.created_at,
        })

    # Payment summary
    total_paid = sum(p.amount for p in payments if p.status == "success")
    payment_list = [
        {
            "id": p.id,
            "policy_id": p.policy_id,
            "policy_number": p.policy_number,
            "policy_name": p.policy_name,
            "amount": p.amount,
            "payment_method": p.payment_method,
            "transaction_id": p.transaction_id,
            "status": p.status,
            "payment_type": p.payment_type,
            "month_number": p.month_number,
            "notes": p.notes,
            "paid_at": p.paid_at,
        }
        for p in payments
    ]

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "custom_id": user.custom_id,
        },
        "profile": {
            "id": profile.id if profile else None,
            "full_name": profile.full_name if profile else None,
            "date_of_birth": profile.date_of_birth if profile else None,
            "phone": profile.phone if profile else None,
            "avatar_url": profile.avatar_url if profile else None,
            "address": profile.address if profile else None,
            "city": profile.city if profile else None,
            "state": profile.state if profile else None,
        } if profile else None,
        "kyc_documents": [
            {
                "id": d.id,
                "document_type": d.document_type,
                "document_number": d.document_number,
                "file_url": d.file_url,
                "verification_status": d.verification_status,
                "notes": d.notes,
                "created_at": d.created_at,
            }
            for d in kyc_docs
        ],
        "insurance_policies": [
            {
                "id": p.id,
                "policy_number": p.policy_number,
                "name": p.name,
                "type": p.type,
                "provider": p.provider,
                "premium": p.premium,
                "coverage": p.coverage,
                "status": p.status,
                "expiry_date": p.expiry_date,
                "auto_payment": p.auto_payment,
                "payment_method": p.payment_method,
                "created_at": p.created_at,
            }
            for p in policies
        ],
        "claims": enriched_claims,
        "payments": payment_list,
        "payment_summary": {
            "total_paid": total_paid,
            "total_transactions": len(payments),
            "successful": len([p for p in payments if p.status == "success"]),
            "failed": len([p for p in payments if p.status == "failed"]),
        },
    }

# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER-SUPPORT — Managers
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/managers", response_model=List[schemas.Manager], tags=["Customer Support"])
def get_managers(db: Session = Depends(get_db)):
    return db.query(models.Manager).all()

@app.post("/managers", response_model=schemas.Manager, tags=["Customer Support"])
def create_manager(manager: schemas.ManagerCreate, db: Session = Depends(get_db)):
    data = manager.dict()
    data["id"] = str(uuid.uuid4())
    db_manager = models.Manager(**data)
    db.add(db_manager)
    db.commit()
    db.refresh(db_manager)
    return db_manager

@app.patch("/managers/{manager_id}", response_model=schemas.Manager, tags=["Customer Support"])
def update_manager(manager_id: str, updates: dict, db: Session = Depends(get_db)):
    m = db.query(models.Manager).filter(models.Manager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Manager not found")
    for k, v in updates.items():
        if hasattr(m, k):
            setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return m


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER-SUPPORT — Agents
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/agents", response_model=List[schemas.Agent], tags=["Customer Support"])
def get_agents(db: Session = Depends(get_db)):
    return db.query(models.Agent).all()

@app.post("/agents", response_model=schemas.Agent, tags=["Customer Support"])
def create_agent(agent: schemas.AgentCreate, db: Session = Depends(get_db)):
    data = agent.dict()
    data["id"] = str(uuid.uuid4())
    db_agent = models.Agent(**data)
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

@app.patch("/agents/{agent_id}", response_model=schemas.Agent, tags=["Customer Support"])
def update_agent(agent_id: str, updates: dict, db: Session = Depends(get_db)):
    a = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Agent not found")
    for k, v in updates.items():
        if hasattr(a, k):
            setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return a

@app.get("/agent/claims", tags=["Insure Agent"])
def get_agent_claims(agent_id: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(require_staff)):
    if current_user.role == "agent":
        agent_id = current_user.id
    agent = db.query(models.Agent).filter(models.Agent.user_id == agent_id).first() if agent_id else None
    query = db.query(models.SupportClaim)
    if agent:
        query = query.filter(models.SupportClaim.assigned_agent_id == agent.id)
    elif agent_id:
        query = query.filter(models.SupportClaim.assigned_agent_id == agent_id)
    return [
        support_claim_to_agent_claim(db, claim, agent_user_id=agent_id)
        for claim in query.order_by(models.SupportClaim.created_at.desc()).all()
    ]

@app.get("/agent/claims/queue", tags=["Insure Agent"])
def get_agent_claim_queue(db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    claims = db.query(models.SupportClaim).filter(models.SupportClaim.status == "pending").order_by(models.SupportClaim.created_at.desc()).all()
    return [support_claim_to_agent_claim(db, claim) for claim in claims]

@app.patch("/agent/claims/{claim_id}", tags=["Insure Agent"])
def update_agent_claim(claim_id: str, updates: dict, db: Session = Depends(get_db), current_user: models.User = Depends(require_staff)):
    claim = db.query(models.SupportClaim).filter(models.SupportClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    agent = db.query(models.Agent).filter(models.Agent.user_id == current_user.id).first()
    if updates.get("assigned_agent_id") and agent:
        claim.assigned_agent_id = agent.id
    if updates.get("assigned_agent_id") is None and "assigned_agent_id" in updates:
        claim.assigned_agent_id = None
    if "status" in updates:
        claim.status = updates["status"]
    assignment = db.query(models.Assignment).filter(models.Assignment.claim_id == claim.id).first()
    if assignment and "status" in updates:
        assignment.status = updates["status"]
    elif agent and claim.assigned_agent_id == agent.id:
        assignment = models.Assignment(
            id=str(uuid.uuid4()),
            claim_id=claim.id,
            agent_id=agent.id,
            assignment_code=f"ASG-{uuid.uuid4().hex[:6].upper()}",
            distance=0,
            travel_cost=0,
            hotel_cost=0,
            total_cost=0,
            status=updates.get("status", "accepted"),
        )
        db.add(assignment)
    db.commit()
    db.refresh(claim)
    return support_claim_to_agent_claim(db, claim, agent_user_id=current_user.id)

@app.get("/messages", tags=["Messaging"])
def list_messages(user_id: Optional[str] = None, peer_id: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(require_staff)):
    participant_id = user_id or current_user.id
    query = db.query(models.Message).filter(
        (models.Message.sender_id == participant_id) | (models.Message.receiver_id == participant_id)
    )
    if peer_id:
        query = query.filter(
            ((models.Message.sender_id == peer_id) & (models.Message.receiver_id == participant_id)) |
            ((models.Message.sender_id == participant_id) & (models.Message.receiver_id == peer_id))
        )
    messages = query.order_by(models.Message.sent_at.asc()).all()
    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "sender_role": m.sender_role,
            "receiver_role": m.receiver_role,
            "content": m.content,
            "file_url": m.file_url,
            "file_name": m.file_name,
            "is_read": m.is_read,
            "sent_at": m.sent_at,
        }
        for m in messages
    ]

@app.post("/messages", tags=["Messaging"])
def create_message(message: dict, db: Session = Depends(get_db), current_user: models.User = Depends(require_staff)):
    receiver_id = message.get("receiver_id")
    content = (message.get("content") or "").strip()
    if not receiver_id or not content:
        raise HTTPException(status_code=400, detail="receiver_id and content are required")
    receiver = db.query(models.User).filter(models.User.id == receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    new_message = models.Message(
        id=str(uuid.uuid4()),
        sender_id=current_user.id,
        receiver_id=receiver_id,
        sender_role=current_user.role,
        receiver_role=receiver.role,
        content=content,
        file_url=message.get("file_url"),
        file_name=message.get("file_name"),
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return {
        "id": new_message.id,
        "sender_id": new_message.sender_id,
        "receiver_id": new_message.receiver_id,
        "sender_role": new_message.sender_role,
        "receiver_role": new_message.receiver_role,
        "content": new_message.content,
        "file_url": new_message.file_url,
        "file_name": new_message.file_name,
        "is_read": new_message.is_read,
        "sent_at": new_message.sent_at,
    }

@app.get("/support/primary-manager", tags=["Messaging"])
def get_primary_manager(db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    manager = db.query(models.User).filter(models.User.role == "manager").order_by(models.User.created_at.asc()).first()
    if not manager:
        raise HTTPException(status_code=404, detail="No support manager account found")
    return {
        "id": manager.id,
        "email": manager.email,
        "full_name": manager.full_name or "Customer Support",
        "role": manager.role,
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER-SUPPORT — Support Claims
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/support-claims", response_model=List[schemas.SupportClaim], tags=["Customer Support"])
def get_support_claims(db: Session = Depends(get_db)):
    return db.query(models.SupportClaim).order_by(models.SupportClaim.created_at.desc()).all()

@app.post("/support-claims", response_model=schemas.SupportClaim, tags=["Customer Support"])
def create_support_claim(claim: schemas.SupportClaimCreate, db: Session = Depends(get_db)):
    data = claim.dict()
    data["id"] = str(uuid.uuid4())
    if not data.get("claim_code"):
        data["claim_code"] = f"CLM-{uuid.uuid4().hex[:6].upper()}"
    db_claim = models.SupportClaim(**data)
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim

@app.patch("/support-claims/{claim_id}", response_model=schemas.SupportClaim, tags=["Customer Support"])
def update_support_claim(claim_id: str, updates: dict, db: Session = Depends(get_db)):
    c = db.query(models.SupportClaim).filter(models.SupportClaim.id == claim_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Claim not found")
    for k, v in updates.items():
        if hasattr(c, k):
            setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER-SUPPORT — Assignments
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/assignments", response_model=List[schemas.Assignment], tags=["Customer Support"])
def get_assignments(db: Session = Depends(get_db)):
    return db.query(models.Assignment).all()

@app.post("/assignments", response_model=schemas.Assignment, tags=["Customer Support"])
def create_assignment(assignment: schemas.AssignmentCreate, db: Session = Depends(get_db)):
    data = assignment.dict()
    data["id"] = str(uuid.uuid4())
    data["assignment_code"] = f"ASG-{uuid.uuid4().hex[:6].upper()}"
    db_asg = models.Assignment(**data)
    db.add(db_asg)
    # Update support claim status
    claim = db.query(models.SupportClaim).filter(models.SupportClaim.id == assignment.claim_id).first()
    if claim:
        claim.status = "assigned"
        claim.assigned_agent_id = assignment.agent_id
    db.commit()
    db.refresh(db_asg)
    return db_asg

@app.patch("/assignments/{asg_id}", response_model=schemas.Assignment, tags=["Customer Support"])
def update_assignment(asg_id: str, updates: dict, db: Session = Depends(get_db)):
    a = db.query(models.Assignment).filter(models.Assignment.id == asg_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    for k, v in updates.items():
        if hasattr(a, k):
            setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return a


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER-SUPPORT — Audit Logs
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/audit-logs", response_model=List[schemas.AuditLog], tags=["Customer Support"])
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).all()

@app.post("/audit-logs", response_model=schemas.AuditLog, tags=["Customer Support"])
def create_audit_log(log: schemas.AuditLogCreate, db: Session = Depends(get_db)):
    new_log = models.AuditLog(id=str(uuid.uuid4()), **log.dict())
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER-SUPPORT — Hospitals
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/hospitals", response_model=List[schemas.Hospital], tags=["Customer Support"])
def get_hospitals(db: Session = Depends(get_db)):
    return db.query(models.Hospital).order_by(models.Hospital.name).all()

@app.post("/hospitals", response_model=schemas.Hospital, tags=["Customer Support"])
def create_hospital(hospital: schemas.HospitalCreate, db: Session = Depends(get_db)):
    new_h = models.Hospital(id=str(uuid.uuid4()), **hospital.dict())
    db.add(new_h)
    db.commit()
    db.refresh(new_h)
    return new_h

@app.patch("/hospitals/{hospital_id}", response_model=schemas.Hospital, tags=["Customer Support"])
def update_hospital(hospital_id: str, updates: dict, db: Session = Depends(get_db)):
    h = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    for k, v in updates.items():
        if hasattr(h, k):
            setattr(h, k, v)
    db.commit()
    db.refresh(h)
    return h

# ═══════════════════════════════════════════════════════════════════════════════
#  HOSPITAL PORTAL (MediClaim) — Routes
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/hospitals/me", tags=["Hospital Portal"])
def get_hospital_me(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.HospitalProfile).filter(models.HospitalProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.HospitalProfile(id=str(uuid.uuid4()), user_id=current_user.id, hospital_name="My Hospital", email=current_user.email)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@app.put("/hospitals/me", tags=["Hospital Portal"])
def update_hospital_me(updates: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.HospitalProfile).filter(models.HospitalProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Hospital profile not found")
    for k, v in updates.items():
        if hasattr(profile, k):
            setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile

@app.get("/policies/lookup", tags=["Hospital Portal"])
def lookup_policy(policy_number: str, db: Session = Depends(get_db)):
    # Lookup in MediPolicy table used by Hospital Form
    # Try searching by policy number first
    policy = db.query(models.MediPolicy).filter(models.MediPolicy.policy_number == policy_number).first()
    
    if not policy:
        # Try searching by 8-digit Customer ID (custom_id)
        user = db.query(models.User).filter(models.User.custom_id == policy_number).first()
        if user:
            # Find policy associated with this user's email
            policy = db.query(models.MediPolicy).filter(models.MediPolicy.email == user.email).first()
            
    if not policy:
        raise HTTPException(status_code=404, detail="Policy or Customer ID not found")
    
    company = db.query(models.InsuranceCompany).filter(models.InsuranceCompany.id == policy.company_id).first()
    return {
        "id": policy.id,
        "policy_number": policy.policy_number,
        "customer_name": policy.customer_name,
        "aadhaar_number": policy.aadhaar_number,
        "pan_number": policy.pan_number,
        "contact_number": policy.contact_number,
        "email": policy.email,
        "policy_type": policy.policy_type,
        "coverage_amount": policy.coverage_amount,
        "start_date": policy.start_date,
        "end_date": policy.end_date,
        "status": policy.status,
        "corporate_company_name": policy.corporate_company_name,
        "insurance_company": {"id": company.id, "company_name": company.company_name} if company else None
    }

@app.get("/dashboard/stats", tags=["Hospital Portal"])
def get_hospital_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.HospitalProfile).filter(models.HospitalProfile.user_id == current_user.id).first()
    claims = db.query(models.HospitalClaim).filter(models.HospitalClaim.hospital_user_id == current_user.id).all()
    
    return {
        "total": len(claims),
        "pending": len([c for c in claims if c.claim_status in ("initiated", "submitted")]),
        "approved": len([c for c in claims if c.claim_status == "approved"]),
        "rejected": len([c for c in claims if c.claim_status == "rejected"]),
        "paid": len([c for c in claims if c.claim_status == "paid"]),
        "monthly": [{"name": "Jan", "claims": 0}, {"name": "Feb", "claims": 0}, {"name": "Mar", "claims": 5}],
        "hospital_name": profile.hospital_name if profile else "Hospital"
    }

@app.get("/claims/", tags=["Hospital Portal"])
def list_hospital_claims(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    claims = db.query(models.HospitalClaim).filter(models.HospitalClaim.hospital_user_id == current_user.id).all()
    result = []
    for c in claims:
        policy = db.query(models.MediPolicy).filter(models.MediPolicy.id == c.policy_id).first()
        result.append({
            "id": c.id,
            "claim_number": c.claim_number,
            "claim_status": c.claim_status,
            "estimated_amount": c.estimated_amount,
            "created_at": c.created_at,
            "policy": {
                "policy_number": policy.policy_number if policy else "N/A",
                "customer_name": policy.customer_name if policy else "N/A",
                "coverage_amount": policy.coverage_amount if policy else 0
            }
        })
    return result

@app.get("/claims/{claim_id}", tags=["Hospital Portal"])
def get_hospital_claim(claim_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    claim = db.query(models.HospitalClaim).filter(models.HospitalClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != "hospital" or claim.hospital_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    policy = db.query(models.MediPolicy).filter(models.MediPolicy.id == claim.policy_id).first() if claim.policy_id else None
    company = None
    if policy and policy.company_id:
        company = db.query(models.InsuranceCompany).filter(models.InsuranceCompany.id == policy.company_id).first()

    return {
        "id": claim.id,
        "claim_number": claim.claim_number,
        "claim_status": claim.claim_status,
        "estimated_amount": claim.estimated_amount,
        "approved_amount": claim.approved_amount,
        "created_at": claim.created_at,
        "diagnosis": claim.diagnosis,
        "doctor_name": claim.doctor_name,
        "admission_date": claim.admission_date,
        "discharge_date": claim.discharge_date,
        "remarks": claim.remarks,
        "patient_details": {
            "patient_name": claim.patient_name,
            "age": claim.patient_age,
            "gender": claim.patient_gender,
            "is_corporate": claim.is_corporate,
        },
        "policy": {
            "policy_number": policy.policy_number if policy else None,
            "customer_name": policy.customer_name if policy else None,
            "coverage_amount": policy.coverage_amount if policy else None,
            "insurance_company": {"company_name": company.company_name} if company else None,
        } if policy else None,
    }

@app.post("/claims/{claim_id}/submit", tags=["Hospital Portal"])
def submit_hospital_claim(claim_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    claim = db.query(models.HospitalClaim).filter(models.HospitalClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != "hospital" or claim.hospital_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    claim.claim_status = "pending_approval"
    db.commit()
    return {"message": "Claim submitted for approval"}

@app.post("/claims/{claim_id}/simulate-approval", tags=["Hospital Portal"])
def simulate_hospital_claim_approval(claim_id: str, decision: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    claim = db.query(models.HospitalClaim).filter(models.HospitalClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != "hospital" or claim.hospital_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    if decision not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid decision")
    claim.claim_status = decision
    db.commit()
    return {"message": f"Claim {decision}"}

@app.post("/claims/{claim_id}/simulate-verification", tags=["Hospital Portal"])
def simulate_hospital_claim_verification(claim_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    claim = db.query(models.HospitalClaim).filter(models.HospitalClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != "hospital" or claim.hospital_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    claim.claim_status = "under_verification"
    db.commit()
    return {"message": "Claim moved to verification"}

@app.post("/claims/{claim_id}/simulate-payment", tags=["Hospital Portal"])
def simulate_hospital_claim_payment(claim_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    claim = db.query(models.HospitalClaim).filter(models.HospitalClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != "hospital" or claim.hospital_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    claim.claim_status = "paid"
    db.commit()
    return {"message": "Claim payment completed"}

@app.post("/claims/{claim_id}/billing", tags=["Hospital Portal"])
def hospital_claim_billing(claim_id: str, billing_data: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    claim = db.query(models.HospitalClaim).filter(models.HospitalClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role != "hospital" or claim.hospital_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    claim.approved_amount = billing_data.get("total_bill", claim.approved_amount)
    if billing_data.get("notes"):
        claim.remarks = billing_data.get("notes")
    db.commit()
    return {"message": "Billing submitted"}

# ═══════════════════════════════════════════════════════════════════════════════
#  HOSPITAL MANAGEMENT (for Support Team)
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/hospitals/all", tags=["Customer Support"])
def list_all_hospitals(db: Session = Depends(get_db)):
    """List all registered hospitals for the support team."""
    profiles = db.query(models.HospitalProfile).all()
    result = []
    for p in profiles:
        # Count claims
        claims = db.query(models.HospitalClaim).filter(models.HospitalClaim.hospital_user_id == p.user_id).all()
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "hospital_name": p.hospital_name,
            "email": p.email,
            "city": p.city,
            "state": p.state,
            "stats": {
                "total": len(claims),
                "approved": len([c for c in claims if c.claim_status == "approved"]),
                "pending": len([c for c in claims if c.claim_status in ("initiated", "submitted")]),
                "completed": len([c for c in claims if c.claim_status == "paid"])
            },
            "hospital_id_8": p.hospital_id_8,
        })
    return result

@app.get("/hospitals/{hospital_user_id}/details", tags=["Customer Support"])
def get_hospital_details(hospital_user_id: str, db: Session = Depends(get_db)):
    """Get detailed profile and claim summary for a specific hospital."""
    profile = db.query(models.HospitalProfile).filter(models.HospitalProfile.user_id == hospital_user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    claims = db.query(models.HospitalClaim).filter(models.HospitalClaim.hospital_user_id == hospital_user_id).all()
    claim_details = []
    for c in claims:
        docs = db.query(models.HospitalClaimDocument).filter(models.HospitalClaimDocument.claim_id == c.id).all()
        claim_details.append({
            "id": c.id,
            "claim_number": c.claim_number,
            "status": c.claim_status,
            "patient": c.patient_name,
            "amount": c.estimated_amount,
            "created_at": c.created_at,
            "documents": [{"id": d.id, "name": d.file_name, "type": d.document_type, "url": d.file_path} for d in docs]
        })

    return {
        "profile": {
            "user_id": profile.user_id,
            "name": profile.hospital_name,
            "email": profile.email,
            "contact": profile.contact_number,
            "address": f"{profile.address}, {profile.city}, {profile.state}" if profile.address else f"{profile.city}, {profile.state}",
            "license": profile.license_number,
            "specialization": profile.specialization,
            "hospital_id_8": profile.hospital_id_8,
        },
        "claims": claim_details
    }

@app.post("/hospitals/claims/{claim_id}/approve", tags=["Customer Support"])
def approve_hospital_claim(claim_id: str, amount: float, remarks: str = None, db: Session = Depends(get_db)):
    claim = db.query(models.HospitalClaim).filter(models.HospitalClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.claim_status = "approved"
    claim.approved_amount = amount
    claim.remarks = remarks
    db.commit()
    return {"message": "Claim approved", "approved_amount": amount}

@app.post("/messages/hospital", tags=["Messaging"])
def send_message_to_hospital(msg: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Generic message route for support ↔ hospital chat."""
    new_msg = models.Message(
        id=str(uuid.uuid4()),
        sender_id=current_user.id,
        receiver_id=msg["receiver_id"],
        sender_role=current_user.role,
        receiver_role="hospital",
        content=msg["content"]
    )
    db.add(new_msg)
    db.commit()
    return new_msg

@app.get("/support/tickets", tags=["Hospital Portal"])
def list_hospital_tickets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.HospitalSupportTicket).filter(models.HospitalSupportTicket.hospital_user_id == current_user.id).all()

@app.post("/support/tickets", tags=["Hospital Portal"])
def create_hospital_ticket(ticket: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_ticket = models.HospitalSupportTicket(
        id=str(uuid.uuid4()),
        hospital_user_id=current_user.id,
        subject=ticket["subject"],
        issue=ticket["issue"]
    )
    db.add(new_ticket)
    db.commit()
    return new_ticket

@app.get("/support/tickets/{ticket_id}/messages", tags=["Hospital Portal"])
def list_ticket_messages(ticket_id: str, db: Session = Depends(get_db)):
    return db.query(models.HospitalSupportMessage).filter(models.HospitalSupportMessage.ticket_id == ticket_id).all()

@app.post("/support/tickets/{ticket_id}/messages", tags=["Hospital Portal"])
def send_ticket_message(ticket_id: str, msg: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_msg = models.HospitalSupportMessage(
        id=str(uuid.uuid4()),
        ticket_id=ticket_id,
        sender_id=current_user.id,
        sender_role=current_user.role,
        message=msg["message"]
    )
    db.add(new_msg)
    return new_msg

@app.post("/claims/{claim_id}/documents", tags=["Hospital Portal"])
async def upload_hospital_claim_doc(claim_id: str, document_type: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a document for a hospital claim."""
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(upload_dir, f"{file_id}{ext}")
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    doc = models.HospitalClaimDocument(
        id=file_id,
        claim_id=claim_id,
        document_type=document_type,
        file_path=f"/uploads/{file_id}{ext}",
        file_name=file.filename
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@app.get("/claims/{claim_id}/documents", tags=["Hospital Portal"])
def list_hospital_claim_docs(claim_id: str, db: Session = Depends(get_db)):
    return db.query(models.HospitalClaimDocument).filter(models.HospitalClaimDocument.claim_id == claim_id).all()


# ═══════════════════════════════════════════════════════════════════════════════
#  HOSPITAL PORTAL — Customer Lookup & Start Claim
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/hospital/lookup/customer/{custom_id}", tags=["Hospital Portal"])
def lookup_customer_for_hospital(custom_id: str, db: Session = Depends(get_db)):
    """Used by hospitals to find a customer and their active health policies using 8-digit ID."""
    user = db.query(models.User).filter(models.User.custom_id == custom_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    profile = db.query(models.Profile).filter(models.Profile.user_id == user.id).first()
    # Find active health policies
    policies = db.query(models.InsurancePolicy).filter(
        models.InsurancePolicy.user_id == user.id,
        models.InsurancePolicy.type.ilike("%health%"),
        models.InsurancePolicy.status == "Active"
    ).all()

    return {
        "customer": {
            "id": user.id,
            "custom_id": user.custom_id,
            "full_name": user.full_name or (profile.full_name if profile else "Unknown"),
            "email": user.email,
            "phone": profile.phone if profile else None,
        },
        "active_policies": [
            {
                "id": p.id,
                "policy_number": p.policy_number,
                "name": p.name,
                "provider": p.provider,
                "coverage": p.coverage,
                "expiry_date": p.expiry_date
            }
            for p in policies
        ]
    }

@app.post("/hospital/claims/start", tags=["Hospital Portal"])
def hospital_start_claim(claim_data: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Create a new hospital claim linked to a customer policy."""
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospitals can initiate these claims")

    new_claim = models.HospitalClaim(
        id=str(uuid.uuid4()),
        claim_number=f"HCL-{uuid.uuid4().hex[:8].upper()}",
        hospital_user_id=current_user.id,
        policy_id=claim_data.get("policy_id"),
        patient_name=claim_data.get("patient_name"),
        patient_age=claim_data.get("patient_age"),
        patient_gender=claim_data.get("patient_gender"),
        diagnosis=claim_data.get("diagnosis"),
        doctor_name=claim_data.get("doctor_name"),
        admission_date=claim_data.get("admission_date"),
        discharge_date=claim_data.get("discharge_date"),
        estimated_amount=claim_data.get("estimated_amount", 0),
        is_corporate=claim_data.get("is_corporate", False),
        remarks=claim_data.get("remarks"),
        claim_status="initiated"
    )
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    return {
        "id": new_claim.id,
        "claim_number": new_claim.claim_number,
        "claim_status": new_claim.claim_status,
        "estimated_amount": new_claim.estimated_amount,
        "approved_amount": new_claim.approved_amount,
        "diagnosis": new_claim.diagnosis,
        "doctor_name": new_claim.doctor_name,
        "admission_date": new_claim.admission_date,
        "discharge_date": new_claim.discharge_date,
        "patient_details": {
            "patient_name": new_claim.patient_name,
            "age": new_claim.patient_age,
            "gender": new_claim.patient_gender,
            "is_corporate": new_claim.is_corporate,
        },
        "remarks": new_claim.remarks,
        "policy_id": new_claim.policy_id
    }

@app.get("/hospitals/public", tags=["Customer Portal"])
def list_hospitals_public(db: Session = Depends(get_db)):
    """Public list of hospitals for the customer portal."""
    profiles = db.query(models.HospitalProfile).all()
    return [
        {
            "id": p.id,
            "name": p.hospital_name,
            "address": p.address,
            "city": p.city,
            "state": p.state,
            "contact": p.contact_number,
            "specialization": p.specialization,
            "hospital_id_8": p.hospital_id_8,
            "email": p.email,
            "license_number": p.license_number,
            "bed_capacity": p.bed_capacity,
        }
        for p in profiles
    ]

@app.get("/hospitals/public/{hospital_id}", tags=["Customer Portal"])
def get_hospital_public(hospital_id: str, db: Session = Depends(get_db)):
    profile = db.query(models.HospitalProfile).filter(models.HospitalProfile.id == hospital_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return {
        "id": profile.id,
        "name": profile.hospital_name,
        "address": profile.address,
        "city": profile.city,
        "state": profile.state,
        "contact": profile.contact_number,
        "specialization": profile.specialization,
        "hospital_id_8": profile.hospital_id_8,
        "email": profile.email,
        "license_number": profile.license_number,
        "bed_capacity": profile.bed_capacity,
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  SEARCH BY 8-DIGIT ID (Customer Support)
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/support/search/customer/{custom_id}", tags=["Customer Support"])
def search_customer_by_id(custom_id: str, db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    user = db.query(models.User).filter(models.User.custom_id == custom_id, models.User.role == "customer").first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found with this ID")
    return get_customer_detail(user.id, db, _)

@app.get("/support/search/agent/{agent_id_8}", tags=["Customer Support"])
def search_agent_by_id(agent_id_8: str, db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    agent = db.query(models.Agent).filter(models.Agent.agent_id_8 == agent_id_8).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found with this ID")
    return agent

@app.get("/support/search/hospital/{hospital_id_8}", tags=["Customer Support"])
def search_hospital_by_id(hospital_id_8: str, db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    # Search in both Hospital and HospitalProfile
    h_profile = db.query(models.HospitalProfile).filter(models.HospitalProfile.hospital_id_8 == hospital_id_8).first()
    if h_profile:
        return get_hospital_details(h_profile.user_id, db)
    
    h = db.query(models.Hospital).filter(models.Hospital.hospital_id_8 == hospital_id_8).first()
    if h:
        return h
        
    raise HTTPException(status_code=404, detail="Hospital not found with this ID")

# ═══════════════════════════════════════════════════════════════════════════════
#  UNIFIED CLAIM ACTIONS (Approval & Completion)
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/support/claims/{claim_id}/approve", tags=["Customer Support"])
def approve_claim_unified(claim_id: str, amount: float, remarks: str = None, db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    """Approve a claim (either customer or hospital initiated)."""
    # Try hospital claim
    h_claim = db.query(models.HospitalClaim).filter(models.HospitalClaim.id == claim_id).first()
    if h_claim:
        h_claim.claim_status = "approved"
        h_claim.approved_amount = amount
        h_claim.remarks = remarks
        db.commit()
        return {"message": "Hospital claim approved", "type": "hospital"}

    # Try customer/support claim
    s_claim = db.query(models.SupportClaim).filter(models.SupportClaim.id == claim_id).first()
    if s_claim:
        s_claim.status = "approved"
        # Update associated customer claim if exists
        if s_claim.customer_claim_id:
            c_claim = db.query(models.CustomerClaim).filter(models.CustomerClaim.id == s_claim.customer_claim_id).first()
            if c_claim:
                c_claim.status = "Approved"
                c_claim.progress = 100
        db.commit()
        return {"message": "Support claim approved", "type": "support"}
    
    # Try agent claim
    a_claim = db.query(models.AgentClaim).filter(models.AgentClaim.id == claim_id).first()
    if a_claim:
        a_claim.status = "approved"
        db.commit()
        return {"message": "Agent claim approved", "type": "agent"}

    raise HTTPException(status_code=404, detail="Claim not found")

@app.post("/support/claims/{claim_id}/verify", tags=["Customer Support"])
def verify_claim_unified(claim_id: str, db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    """Verify a claim."""
    s_claim = db.query(models.SupportClaim).filter(models.SupportClaim.id == claim_id).first()
    if s_claim:
        s_claim.is_verified = True
        
        # Also update customer claim
        if s_claim.customer_claim_id:
            c_claim = db.query(models.CustomerClaim).filter(models.CustomerClaim.id == s_claim.customer_claim_id).first()
            if c_claim:
                c_claim.is_verified = True
                
        db.commit()
        return {"message": "Claim verified successfully"}

    raise HTTPException(status_code=404, detail="Claim not found")

@app.post("/support/claims/{claim_id}/settle", tags=["Customer Support"])
def settle_claim_unified(claim_id: str, amount: float, db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    """Settle a claim with a specific amount."""
    s_claim = db.query(models.SupportClaim).filter(models.SupportClaim.id == claim_id).first()
    if s_claim:
        if amount > s_claim.estimated_value:
            raise HTTPException(status_code=400, detail="Settled amount cannot be greater than requested amount")
            
        s_claim.status = "Claimed"
        s_claim.settled_amount = amount
        
        # Update associated customer claim
        if s_claim.customer_claim_id:
            c_claim = db.query(models.CustomerClaim).filter(models.CustomerClaim.id == s_claim.customer_claim_id).first()
            if c_claim:
                c_claim.status = "Claimed"
                c_claim.settled_amount = amount
                c_claim.progress = 100
                
        # Update agent claim if exists
        a_claim = db.query(models.AgentClaim).filter(models.AgentClaim.id == claim_id).first()
        if a_claim:
            a_claim.status = "Claimed"
            a_claim.claim_amount = amount
            
        # Update assignment status
        assignment = db.query(models.Assignment).filter(models.Assignment.claim_id == claim_id).first()
        if assignment:
            assignment.status = "completed"

        db.commit()
        return {"message": f"Claim settled with amount ₹{amount}"}

    raise HTTPException(status_code=404, detail="Claim not found")

@app.post("/support/claims/{claim_id}/complete", tags=["Customer Support"])
def complete_claim_unified(claim_id: str, db: Session = Depends(get_db), _: models.User = Depends(require_staff)):
    """Complete a claim and simulate fund transfer."""
    message = "Claim completed. "
    
    # Hospital Claim logic
    h_claim = db.query(models.HospitalClaim).filter(models.HospitalClaim.id == claim_id).first()
    if h_claim:
        h_claim.claim_status = "paid"
        message += f"Amount ₹{h_claim.approved_amount} has been transferred directly to the hospital's bank account."
        db.commit()
        return {"message": message, "type": "hospital"}

    # Support/Customer Claim logic
    s_claim = db.query(models.SupportClaim).filter(models.SupportClaim.id == claim_id).first()
    if s_claim:
        s_claim.status = "completed"
        if s_claim.customer_claim_id:
            c_claim = db.query(models.CustomerClaim).filter(models.CustomerClaim.id == s_claim.customer_claim_id).first()
            if c_claim:
                c_claim.status = "Settled"
                c_claim.progress = 100
        message += "Funds transferred to customer account."
        db.commit()
        return {"message": message, "type": "support"}

    raise HTTPException(status_code=404, detail="Claim not found")

@app.post("/agent/claims/{claim_id}/documents", tags=["Insure Agent"])
async def upload_agent_document(
    claim_id: str, 
    file: UploadFile = File(...), 
    document_type: str = Form("evidence"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Upload a document/photo from the agent app."""
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    file_path = f"uploads/agent_{file_id}{ext}"
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    doc = models.AgentClaimDocument(
        id=file_id,
        claim_id=claim_id,
        agent_id=current_user.id,
        file_name=file.filename,
        file_url=f"/{file_path}",
        document_type=document_type
    )
    db.add(doc)
    
    # Automatically update status if it was 'accepted' or 'in_progress'
    claim = db.query(models.AgentClaim).filter(models.AgentClaim.id == claim_id).first()
    if claim and claim.status in ("accepted", "in_progress"):
        claim.status = "documents_uploaded"
        
    db.commit()
    db.refresh(doc)
    return doc

@app.get("/claims/{claim_id}/all-documents", tags=["Customer Support"])
def get_all_claim_documents(claim_id: str, db: Session = Depends(get_db)):
    """Fetch documents from all sources (Customer, Agent, Hospital) for a claim."""
    # This is a bit complex since claim IDs might differ between systems, 
    # but we can try to find associated records.
    
    # 1. Hospital documents
    h_docs = db.query(models.HospitalClaimDocument).filter(models.HospitalClaimDocument.claim_id == claim_id).all()
    
    # 2. Agent documents (might be linked by claim_id or claim_number)
    a_docs = db.query(models.AgentClaimDocument).filter(models.AgentClaimDocument.claim_id == claim_id).all()
    
    # 3. Customer documents (KYC etc - usually linked to user_id, but here we want claim related)
    # If claim_id is a support_claim_id, find customer_claim_id
    s_claim = db.query(models.SupportClaim).filter(models.SupportClaim.id == claim_id).first()
    if not s_claim:
        # maybe it's a customer_claim_id
        c_claim = db.query(models.CustomerClaim).filter(models.CustomerClaim.id == claim_id).first()
        if c_claim:
            s_claim = db.query(models.SupportClaim).filter(models.SupportClaim.customer_claim_id == c_claim.id).first()

    results = []
    for d in h_docs:
        results.append({"id": d.id, "name": d.file_name, "type": d.document_type, "url": d.file_path, "source": "hospital"})
    for d in a_docs:
        results.append({"id": d.id, "name": d.file_name, "type": d.document_type, "url": d.file_url, "source": "agent"})
        
    return results
