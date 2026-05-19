# Agent Command Center

A comprehensive insurance claim management system built with **React + TypeScript** frontend and **FastAPI + SQLAlchemy** backend, using **SQLite** as the database.

## Project Structure

```
Manager/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # FastAPI application and routes
│   ├── database.py         # SQLAlchemy database configuration
│   ├── models.py           # SQLAlchemy ORM models
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── crud.py             # Database CRUD operations
│   ├── utils.py            # Utility functions (auth, hashing, JWT)
│   ├── seed_data.py        # Database seeding script
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example        # Environment variables template
│   └── venv/               # Virtual environment (created on setup)
│
├── src/                     # React TypeScript frontend
│   ├── components/         # React components
│   ├── contexts/           # React contexts (AuthContext, etc.)
│   ├── pages/              # Page components
│   ├── services/           # API client and services
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── App.tsx             # Main App component
│   └── main.tsx            # React entry point
│
├── public/                  # Static assets
├── package.json            # Node.js dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Frontend environment template
├── setup.sh                # Setup script (Linux/Mac)
├── setup.bat               # Setup script (Windows)
└── README.md               # This file
```

## Technology Stack

### Backend
- **Python 3.8+**
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **Pydantic** - Data validation
- **Python-Jose** - JWT authentication
- **Passlib** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **React Query** - Data fetching
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library

## Features

- **User Management**: Admin, Manager, and Agent roles
- **Claim Management**: Create, update, and track insurance claims
- **Agent Management**: Manage agent profiles and assign claims
- **Analytics**: Dashboard with key metrics
- **Messaging**: Internal communication system
- **Notifications**: Real-time notifications
- **Authentication**: JWT-based authentication with role-based access control

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Quick Setup

#### Windows
```bash
setup.bat
```

#### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database
python seed_data.py

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup

In a new terminal:

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Default Credentials

After running `seed_data.py`, you can login with:

| Role    | Username | Password    |
|---------|----------|------------|
| Admin   | admin    | admin123   |
| Manager | manager1 | manager123 |
| Agent   | agent1   | agent123   |

## API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Database Models

### Core Models

- **User**: User accounts with authentication
- **Agent**: Agent profiles with specialization and performance metrics
- **Claim**: Insurance claims with status tracking
- **ClaimDocument**: Documents attached to claims
- **ClaimNote**: Notes on claims for internal comments
- **Message**: Internal messaging system
- **Notification**: User notifications
- **Analytics**: Performance analytics and metrics

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=sqlite:///./agent_command_center.db
SQL_ECHO=False
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

## Development Scripts

### Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
npm run test     # Run tests
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/{user_id}` - Get user by ID
- `PUT /api/users/{user_id}` - Update user

### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/{agent_id}` - Get agent by ID
- `POST /api/agents` - Create agent (admin only)
- `PUT /api/agents/{agent_id}` - Update agent

### Claims
- `GET /api/claims` - Get all claims
- `GET /api/claims/{claim_id}` - Get claim by ID
- `POST /api/claims` - Create claim
- `PUT /api/claims/{claim_id}` - Update claim
- `GET /api/agents/{agent_id}/claims` - Get claims for agent

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages` - Get messages for user

### Notifications
- `POST /api/notifications` - Create notification (admin only)
- `GET /api/notifications` - Get notifications for user
- `PUT /api/notifications/{notification_id}/read` - Mark as read

## Testing

Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
npm run test
```

## Building for Production

### Backend
```bash
cd backend
# Use a production ASGI server like Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

### Frontend
```bash
npm run build
# Output will be in dist/
```

## Troubleshooting

### Backend won't start
- Check Python version: `python --version`
- Ensure virtual environment is activated
- Check port 8000 is not in use: `lsof -i :8000`

### Frontend won't connect to backend
- Verify backend is running on `http://localhost:8000`
- Check CORS is enabled (should be by default)
- Verify `.env` file has correct `VITE_API_URL`

### Database errors
- Delete `agent_command_center.db` to reset
- Re-run `python seed_data.py`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue in the repository.
