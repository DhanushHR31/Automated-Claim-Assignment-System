from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import uuid
from typing import List

import models, schemas, database
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Customer Portal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key-customer-portal"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    new_user = models.User(id=user_id, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    
    # Create empty profile
    new_profile = models.Profile(id=str(uuid.uuid4()), user_id=user_id)
    db.add(new_profile)
    
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": new_user.id, "email": new_user.email}}

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "email": db_user.email}}

@app.get("/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email}

# Profiles
@app.get("/profiles", response_model=schemas.Profile)
def get_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(id=str(uuid.uuid4()), user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@app.patch("/profiles", response_model=schemas.Profile)
def update_profile(profile_update: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(id=str(uuid.uuid4()), user_id=current_user.id)
        db.add(profile)
        
    for key, value in profile_update.items():
        if hasattr(profile, key):
            setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

# KYC Documents
@app.get("/kyc_documents", response_model=List[schemas.KYCDocument])
def get_kyc_documents(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.KYC_Document).filter(models.KYC_Document.user_id == current_user.id).all()

@app.post("/kyc_documents", response_model=schemas.KYCDocument)
def create_kyc_document(doc: schemas.KYCDocumentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if doc exists, otherwise create
    existing_doc = db.query(models.KYC_Document).filter(
        models.KYC_Document.user_id == current_user.id,
        models.KYC_Document.document_type == doc.document_type
    ).first()
    
    if existing_doc:
        existing_doc.document_number = doc.document_number
        existing_doc.file_url = doc.file_url
        existing_doc.verification_status = doc.verification_status
        db_doc = existing_doc
    else:
        doc_data = doc.dict()
        doc_data["id"] = str(uuid.uuid4())
        doc_data["user_id"] = current_user.id
        db_doc = models.KYC_Document(**doc_data)
        db.add(db_doc)
        
    db.commit()
    db.refresh(db_doc)
    return db_doc

# Insurance Policies
@app.get("/insurance_policies", response_model=List[schemas.InsurancePolicy])
def get_insurance_policies(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.InsurancePolicy).filter(models.InsurancePolicy.user_id == current_user.id).order_by(models.InsurancePolicy.created_at.desc()).all()

@app.get("/insurance_policies/{policy_id}", response_model=schemas.InsurancePolicy)
def get_insurance_policy(policy_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.InsurancePolicy).filter(models.InsurancePolicy.id == policy_id, models.InsurancePolicy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy

@app.post("/insurance_policies", response_model=schemas.InsurancePolicy)
def create_insurance_policy(policy: schemas.InsurancePolicyCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy_data = policy.dict()
    policy_data["id"] = str(uuid.uuid4())
    policy_data["user_id"] = current_user.id
    db_policy = models.InsurancePolicy(**policy_data)
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy

@app.patch("/insurance_policies/{policy_id}", response_model=schemas.InsurancePolicy)
def update_insurance_policy(policy_id: str, updates: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.InsurancePolicy).filter(models.InsurancePolicy.id == policy_id, models.InsurancePolicy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    for key, value in updates.items():
        if hasattr(policy, key):
            setattr(policy, key, value)
            
    db.commit()
    db.refresh(policy)
    return policy

# Claims
@app.get("/claims", response_model=List[schemas.Claim])
def get_claims(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Claim).filter(models.Claim.user_id == current_user.id).order_by(models.Claim.created_at.desc()).all()

@app.post("/claims", response_model=schemas.Claim)
def create_claim(claim: schemas.ClaimCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    claim_data = claim.dict()
    claim_data["id"] = str(uuid.uuid4())
    claim_data["user_id"] = current_user.id
    db_claim = models.Claim(**claim_data)
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim
