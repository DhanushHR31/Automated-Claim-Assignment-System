# Agent Command Center - Comprehensive Setup & Running Guide

## ✅ Setup Complete!

The Agent Command Center has been successfully rebuilt with:
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: React + TypeScript + Vite
- **Database**: Pre-configured with sample data

---

## 🚀 Quick Start (30 seconds)

### Terminal 1: Start Backend
```bash
cd Manager/backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Terminal 2: Start Frontend
```bash
cd Manager
npm run dev
```

Expected output:
```
VITE v... ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 3. Open Browser
Visit: **http://localhost:5173**

### 4. Login
- Username: `admin` or `manager1` or `agent1`
- Password: `admin123` or `manager123` or `agent123`

---

## 📋 Project Structure

```
Manager/
├── backend/
│   ├── main.py              ← FastAPI application (30+ routes)
│   ├── models.py            ← Database models
│   ├── schemas.py           ← Request/response schemas
│   ├── crud.py              ← Database operations
│   ├── database.py          ← Database config
│   ├── utils.py             ← Auth utilities
│   ├── seed_data.py         ← Demo data
│   ├── requirements.txt      ← Python dependencies
│   ├── .env                 ← Configuration
│   ├── agent_command_center.db  ← SQLite database
│   └── venv/                ← Virtual environment
│
├── src/
│   ├── services/apiClient.ts    ← API client
│   ├── contexts/AuthContext.tsx ← Auth logic
│   ├── components/              ← UI components
│   ├── pages/                   ← Page components
│   └── App.tsx                  ← Main app
│
├── README.md
├── QUICKSTART.md
└── [other config files]
```

---

## 🔌 API Endpoints

### Base URL
`http://localhost:8000/api`

### Authentication
```
POST   /auth/login              Login user
POST   /auth/register           Register new user
```

### Users
```
GET    /users                   Get all users (admin)
GET    /users/{user_id}         Get user by ID
PUT    /users/{user_id}         Update user
```

### Agents
```
GET    /agents                  Get all agents
GET    /agents/{agent_id}       Get agent by ID
POST   /agents                  Create agent (admin)
PUT    /agents/{agent_id}       Update agent
GET    /agents/{agent_id}/claims Get agent's claims
```

### Claims
```
GET    /claims                  Get all claims
GET    /claims/{claim_id}       Get claim by ID
POST   /claims                  Create claim
PUT    /claims/{claim_id}       Update claim
```

### Documents & Notes
```
POST   /claims/{claim_id}/documents     Upload document
GET    /claims/{claim_id}/documents     Get documents
POST   /claims/{claim_id}/notes         Add note
GET    /claims/{claim_id}/notes         Get notes
```

### Messages & Notifications
```
POST   /messages                Send message
GET    /messages                Get messages
POST   /notifications           Create notification
GET    /notifications           Get notifications
PUT    /notifications/{id}/read Mark as read
```

### Full API Documentation
**Swagger UI**: http://localhost:8000/docs
**ReDoc**: http://localhost:8000/redoc

---

## 📊 Database Models

### User
- Roles: Admin, Manager, Agent
- JWT authentication
- Password hashing with bcrypt

### Agent
- Specialization field
- Performance rating
- Success rate tracking
- Total claims handled

### Claim
- Status tracking (pending, assigned, in progress, resolved, rejected, closed)
- Priority levels (low, medium, high, urgent)
- Auto-generated claim numbers (CLM-YYYY-#####)
- Document attachments
- Internal notes system

### Supporting Models
- ClaimDocument - File attachments
- ClaimNote - Internal notes
- Message - Internal messaging
- Notification - User alerts
- Analytics - Performance metrics

---

## 🔑 Default Credentials

After database seeding, three test users are available:

| Role    | Username | Password    | Email               |
|---------|----------|------------|-------------------|
| Admin   | admin    | admin123   | admin@example.com   |
| Manager | manager1 | manager123 | manager1@example.com |
| Agent   | agent1   | agent123   | agent1@example.com  |

---

## 🛠️ Configuration

### Backend (.env)
```env
DATABASE_URL=sqlite:///./agent_command_center.db
SQL_ECHO=False
SECRET_KEY=your-secret-key-change-this-in-production-12345
ACCESS_TOKEN_EXPIRE_MINUTES=30
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🔍 Troubleshooting

### Backend Won't Start

**Error**: `Address already in use`
```bash
# Find process on port 8000
netstat -ano | findstr :8000

# Kill process (on Windows, replace PID)
taskkill /PID <PID> /F

# Or use different port
python -m uvicorn main:app --reload --port 8001
```

**Error**: `ModuleNotFoundError`
```bash
# Ensure virtual environment is activated
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### Frontend Won't Connect

**Problem**: 404 errors on API calls
- ✓ Backend running on port 8000?
- ✓ `.env` has correct `VITE_API_URL`?
- ✓ CORS enabled in backend (should be by default)?

**Solution**:
```bash
# Clear cache and reload
Ctrl+Shift+Delete (hard refresh)

# Check browser console for actual errors
F12 → Console tab
```

### Database Issues

**Error**: `sqlite database is locked`
```bash
# Delete and reset database
cd backend
del agent_command_center.db
python seed_data.py
```

**Error**: `No such table`
```bash
# Reseed database
python seed_data.py
```

---

## 📝 Development Workflow

### Backend Development
1. Files auto-reload on changes (hot reload)
2. Check terminal for error messages
3. Access http://localhost:8000/docs for API testing

### Frontend Development
1. Vite provides instant hot module replacement
2. Changes appear instantly in browser
3. Check browser console (F12) for errors

### Adding New Features

#### Backend
1. Add model in `models.py`
2. Add schema in `schemas.py`
3. Add CRUD operations in `crud.py`
4. Add routes in `main.py`

#### Frontend
1. Use `apiClient` to make requests
2. Create component in `src/components/`
3. Add page in `src/pages/`
4. Update routing in `App.tsx`

---

## 🚢 Production Deployment

### Backend
```bash
# Option 1: Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 backend.main:app

# Option 2: Using Docker
# Create Dockerfile in backend/
# Build and run container
```

### Frontend
```bash
# Build for production
npm run build

# Output: dist/ folder
# Deploy dist/ folder to web server (Nginx, Apache, etc.)
```

### Environment Variables for Production
```env
# Backend .env
SECRET_KEY=your-very-secure-production-key-generate-this
DATABASE_URL=postgresql://user:password@host:5432/dbname
SQL_ECHO=False
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Frontend .env
VITE_API_URL=https://your-domain.com/api
```

---

## 📚 Additional Resources

- **Backend Documentation**: See `backend/README.md` (generated from comments)
- **Frontend**: React + Vite + TypeScript
- **Database**: SQLite for development, use PostgreSQL for production
- **Authentication**: JWT tokens stored in localStorage

---

## ✨ What's New in This Rebuild

✅ Modern backend framework (FastAPI)
✅ Type-safe schemas (Pydantic)
✅ JWT authentication
✅ Role-based access control
✅ Comprehensive API documentation
✅ Automatic database initialization
✅ Sample data seeding
✅ Hot reload for development
✅ CORS support
✅ Error handling and validation

---

## 🎯 Next Steps

1. **Run the application** (see Quick Start above)
2. **Test login** with provided credentials
3. **Explore API** at http://localhost:8000/docs
4. **Create new claims** through the UI
5. **Assign claims** to agents
6. **Check analytics** dashboard

---

## 💬 Support

If you encounter any issues:
1. Check error messages in terminal (backend) or console (frontend)
2. Review troubleshooting section above
3. Check API documentation at `/docs`
4. Verify `.env` configuration files
5. Ensure ports 8000 and 5173 are available

---

**Happy coding! 🚀**
