# Quick Start Guide

## Agent Command Center - Full Stack Application

This guide will help you start the Agent Command Center application with both the backend and frontend.

### Prerequisites

- **Python 3.8+** installed and accessible as `python`
- **Node.js 16+** and npm installed
- Port **8000** (backend) and **5173** (frontend) must be available

### Step 1: Start the Backend (Terminal 1)

```bash
cd "Manager/backend"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

The backend API will be available at:
- Main API: `http://localhost:8000/api`
- Swagger API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Step 2: Start the Frontend (Terminal 2)

```bash
cd "Manager"
npm run dev
```

You should see output like:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3: Access the Application

Open your browser and go to: **http://localhost:5173**

### Default Login Credentials

| Role    | Username | Password    |
|---------|----------|------------|
| Admin   | admin    | admin123   |
| Manager | manager1 | manager123 |
| Agent   | agent1   | agent123   |

## Project Structure

```
Manager/
├── backend/              # Python FastAPI application
│   ├── main.py          # FastAPI app with all routes
│   ├── models.py        # Database models
│   ├── schemas.py       # Request/response schemas
│   ├── crud.py          # Database operations
│   ├── database.py      # Database configuration
│   ├── utils.py         # Utility functions
│   └── agent_command_center.db  # SQLite database (created on first run)
│
└── src/                  # React TypeScript frontend
    ├── components/       # React components
    ├── contexts/        # React contexts
    ├── pages/           # Page components
    ├── services/        # API client (apiClient.ts)
    └── App.tsx          # Main app component
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/{user_id}` - Get user by ID

### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/{agent_id}` - Get agent by ID

### Claims
- `GET /api/claims` - Get all claims
- `GET /api/claims/{claim_id}` - Get claim by ID
- `POST /api/claims` - Create new claim

### Full API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# If in use, kill the process or use a different port
python -m uvicorn main:app --reload --port 8001
```

### Frontend won't connect to backend
- Make sure backend is running on `http://localhost:8000`
- Check `.env` file has `VITE_API_URL=http://localhost:8000/api`
- Clear browser cache (Ctrl+Shift+Delete)

### Database errors
```bash
# Delete the database and reseed
cd backend
del agent_command_center.db
python seed_data.py
```

### Dependencies not installing
```bash
# Try updating pip first
python -m pip install --upgrade pip

# Then install requirements
pip install -r backend/requirements.txt
```

## Development

### Backend Development
- Hot reload is enabled (change files and it auto-reloads)
- Check logs in terminal for errors
- Access API at `http://localhost:8000/api`

### Frontend Development
- Vite provides instant Hot Module Replacement (HMR)
- Changes appear immediately in browser
- Check browser console for errors

## Production Deployment

### Backend
```bash
# Use Gunicorn for production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 backend.main:app
```

### Frontend
```bash
# Build for production
npm run build

# Output will be in dist/ folder
# Deploy the dist/ folder to your web server
```

## Support

- Backend API Documentation: http://localhost:8000/docs
- Project README: See Manager/README.md
- Issues: Check logs in both terminals for error messages

## Next Steps

1. ✅ Start backend and frontend (see steps above)
2. Login with admin credentials
3. Navigate to manage agents and claims
4. Check Analytics dashboard
5. Explore the API documentation at http://localhost:8000/docs
