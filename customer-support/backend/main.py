from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext

import models, schemas, database
from database import engine, get_db

# Security Configuration
SECRET_KEY = "your-secret-key-for-jwt-keep-it-safe"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Claim Assignment API - Full Stack")

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
    return {"message": "Claim Assignment API with Local Auth is running"}

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

# Managers
@app.get("/managers", response_model=List[schemas.Manager])
def get_managers(db: Session = Depends(get_db)):
    return db.query(models.Manager).all()

@app.post("/managers", response_model=schemas.Manager)
def create_manager(manager: schemas.ManagerCreate, db: Session = Depends(get_db)):
    data = manager.dict()
    if not data.get("id"):
        data["id"] = str(uuid.uuid4())
    db_manager = models.Manager(**data)
    db.add(db_manager)
    db.commit()
    db.refresh(db_manager)
    return db_manager

@app.patch("/managers/{manager_id}", response_model=schemas.Manager)
def update_manager(manager_id: str, manager_update: dict, db: Session = Depends(get_db)):
    db_manager = db.query(models.Manager).filter(models.Manager.id == manager_id).first()
    if not db_manager:
        raise HTTPException(status_code=404, detail="Manager not found")
    
    for key, value in manager_update.items():
        if hasattr(db_manager, key):
            setattr(db_manager, key, value)
    
    db.commit()
    db.refresh(db_manager)
    return db_manager

# Agents
@app.get("/agents", response_model=List[schemas.Agent])
def get_agents(db: Session = Depends(get_db)):
    return db.query(models.Agent).all()

@app.post("/agents", response_model=schemas.Agent)
def create_agent(agent: schemas.AgentCreate, db: Session = Depends(get_db)):
    data = agent.dict()
    if not data.get("id"):
        data["id"] = str(uuid.uuid4())
    db_agent = models.Agent(**data)
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

@app.patch("/agents/{agent_id}", response_model=schemas.Agent)
def update_agent(agent_id: str, agent_update: dict, db: Session = Depends(get_db)):
    db_agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    for key, value in agent_update.items():
        if hasattr(db_agent, key):
            setattr(db_agent, key, value)
    
    db.commit()
    db.refresh(db_agent)
    return db_agent

# Claims
@app.get("/claims", response_model=List[schemas.Claim])
def get_claims(db: Session = Depends(get_db)):
    return db.query(models.Claim).order_by(models.Claim.created_at.desc()).all()

@app.post("/claims", response_model=schemas.Claim)
def create_claim(claim: schemas.ClaimCreate, db: Session = Depends(get_db)):
    data = claim.dict()
    if not data.get("id"):
        data["id"] = str(uuid.uuid4())
    if not data.get("claim_code"):
        data["claim_code"] = f"CLM-{uuid.uuid4().hex[:6].upper()}"
    db_claim = models.Claim(**data)
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim

@app.patch("/claims/{claim_id}", response_model=schemas.Claim)
def update_claim(claim_id: str, claim_update: dict, db: Session = Depends(get_db)):
    db_claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not db_claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    for key, value in claim_update.items():
        if hasattr(db_claim, key):
            setattr(db_claim, key, value)
    
    db.commit()
    db.refresh(db_claim)
    return db_claim

# Assignments
@app.get("/assignments", response_model=List[schemas.Assignment])
def get_assignments(db: Session = Depends(get_db)):
    return db.query(models.Assignment).all()

@app.post("/assignments", response_model=schemas.Assignment)
def create_assignment(assignment: schemas.AssignmentCreate, db: Session = Depends(get_db)):
    data = assignment.dict()
    if not data.get("id"):
        data["id"] = str(uuid.uuid4())
    if not data.get("assignment_code"):
        data["assignment_code"] = f"ASG-{uuid.uuid4().hex[:6].upper()}"
    db_assignment = models.Assignment(**data)
    db.add(db_assignment)
    
    # Update claim status
    db_claim = db.query(models.Claim).filter(models.Claim.id == assignment.claim_id).first()
    if db_claim:
        db_claim.status = "assigned"
        db_claim.assigned_agent_id = assignment.agent_id
    
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

# Audit Logs
@app.get("/audit-logs", response_model=List[schemas.AuditLog])
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).all()


# Customers
@app.get("/customers", response_model=List[schemas.Customer])
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).order_by(models.Customer.created_at.desc()).all()

@app.post("/customers", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    data = customer.dict()
    data["id"] = str(uuid.uuid4())
    if not data.get("policy_number"):
        data["policy_number"] = f"POL-{uuid.uuid4().hex[:8].upper()}"
    db_customer = models.Customer(**data)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@app.patch("/customers/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: str, updates: dict, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in updates.items():
        if hasattr(db_customer, key):
            setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted"}


# Hospitals
@app.get("/hospitals", response_model=List[schemas.Hospital])
def get_hospitals(db: Session = Depends(get_db)):
    return db.query(models.Hospital).order_by(models.Hospital.name).all()

@app.post("/hospitals", response_model=schemas.Hospital)
def create_hospital(hospital: schemas.HospitalCreate, db: Session = Depends(get_db)):
    data = hospital.dict()
    data["id"] = str(uuid.uuid4())
    db_hospital = models.Hospital(**data)
    db.add(db_hospital)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

@app.patch("/hospitals/{hospital_id}", response_model=schemas.Hospital)
def update_hospital(hospital_id: str, updates: dict, db: Session = Depends(get_db)):
    db_hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not db_hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    for key, value in updates.items():
        if hasattr(db_hospital, key):
            setattr(db_hospital, key, value)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

@app.delete("/hospitals/{hospital_id}")
def delete_hospital(hospital_id: str, db: Session = Depends(get_db)):
    db_hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not db_hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    db.delete(db_hospital)
    db.commit()
    return {"message": "Hospital deleted"}
