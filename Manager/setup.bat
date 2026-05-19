@echo off
setlocal enabledelayedexpansion

color 0E
echo.
echo ================================
echo Agent Command Center Startup
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.8+
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js
    pause
    exit /b 1
)

REM Create backend .env file if it doesn't exist
if not exist "backend\.env" (
    echo Creating backend\.env file...
    copy backend\.env.example backend\.env
    echo backend\.env created
)

REM Create frontend .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file for frontend...
    copy .env.example .env
    echo .env created
)

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo Backend dependencies installed
cd ..

REM Seed database
echo.
echo Seeding database...
cd backend
python seed_data.py
cd ..
echo Database seeded

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
call npm install
echo Frontend dependencies installed

echo.
echo ================================
echo Setup completed successfully!
echo ================================
echo.
echo To start the application:
echo.
echo Terminal 1 - Start Backend:
echo   cd backend
echo   call venv\Scripts\activate.bat
echo   uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.
echo Terminal 2 - Start Frontend:
echo   npm run dev
echo.
echo Default Credentials:
echo   Admin:   admin / admin123
echo   Manager: manager1 / manager123
echo   Agent:   agent1 / agent123
echo.
pause
