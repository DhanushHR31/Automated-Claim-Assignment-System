@echo off
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Starting MediClaim FastAPI backend on http://localhost:8000
echo API docs: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
