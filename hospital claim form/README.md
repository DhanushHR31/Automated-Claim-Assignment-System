# MediClaim — Hospital Insurance Claim Portal

Rebuilt with **Python / FastAPI / SQLAlchemy / SQLite** backend + **React / TanStack Router** frontend.

## Quick Start

### 1. Backend (FastAPI + SQLite)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API runs at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 2. Frontend (React + Vite)

```bash
npm install
npm run dev
```

App runs at: http://localhost:5173

---

## Architecture

```
backend/
  app/
    main.py          # FastAPI app, CORS, startup
    database.py      # SQLAlchemy SQLite engine
    models.py        # All ORM models
    schemas.py       # Pydantic request/response schemas
    auth.py          # JWT auth (python-jose + bcrypt)
    seed.py          # Insurance companies + policies seed data
    routers/
      auth.py        # POST /api/auth/register, /api/auth/login
      hospitals.py   # GET/PUT /api/hospitals/me
      policies.py    # GET /api/policies/lookup
      claims.py      # CRUD + workflow actions
      documents.py   # File upload/download
      billing.py     # Billing list
      payments.py    # Payments list
      support.py     # Tickets + messages
      dashboard.py   # Stats + chart data

src/
  lib/
    api.ts           # Typed fetch client (replaces Supabase)
    auth.tsx         # JWT auth context (localStorage)
  routes/            # All pages (unchanged UI)
```

## Sample Policies (pre-seeded)

| Policy # | Patient | Status |
|----------|---------|--------|
| POL-1001 | Rahul Sharma | Active |
| POL-1002 | Priya Verma | Active |
| POL-1003 | Amit Patel (Corporate - TCS) | Active |
| POL-1004 | Sneha Iyer | **Expired** |
| POL-1005 | Vikram Singh (Corporate - Infosys) | Active |
