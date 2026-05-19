from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, SessionLocal
from app import models
from app.seed import run_seed
from app.routers import auth, hospitals, policies, claims, documents, billing, payments, support, dashboard

# Create all tables
models.Base.metadata.create_all(bind=engine)

# Seed data
db = SessionLocal()
try:
    run_seed(db)
finally:
    db.close()

app = FastAPI(title="MediClaim API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api")
app.include_router(hospitals.router, prefix="/api")
app.include_router(policies.router, prefix="/api")
app.include_router(claims.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(billing.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(support.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

# Serve uploaded files
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "MediClaim API running"}
