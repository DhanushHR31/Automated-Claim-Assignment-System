# Run Instructions for Insurance Projects

This file contains the terminal commands needed to run the following apps:
- `customer`
- `customer-support`
- `insure-agent`
- `hospital claim form`

> Note: All four frontends currently expect the backend API at `http://localhost:8000`.
> That means you should run one app stack at a time unless you update each frontend to use a different backend port.

## 1) `customer`

### Install frontend dependencies
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\customer"
npm install
```

### Create Python backend environment
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\customer\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy pydantic python-multipart python-jose[cryptography] passlib[bcrypt]
```

### Start the backend
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start the frontend
Open a new terminal window and run:
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\customer"
npm run dev
```

## 2) `customer-support`

### Install frontend dependencies
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\customer-support"
npm install
```

### Create Python backend environment
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\customer-support\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Start the backend
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start the frontend
Open a new terminal window and run:
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\customer-support"
npm run dev
```

## 3) `insure-agent`

### Install frontend dependencies
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\insure-agent"
npm install
```

### Create Python backend environment
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\insure-agent\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy pydantic python-multipart python-jose[cryptography] passlib[bcrypt]
```

### Start the backend
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start the frontend
Open a new terminal window and run:
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\insure-agent"
npm run dev
```

## 4) `hospital claim form`

### Install frontend dependencies
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\hospital claim form"
npm install
```

### Create Python backend environment
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\hospital claim form\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Start the backend
You can either run the provided batch file or use uvicorn directly:

```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\hospital claim form\backend"
.\start.bat
```

or
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start the frontend
Open a new terminal window and run:
```powershell
cd "c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\hospital claim form"
npm run dev
```

## Important notes
- If you run multiple apps at once, each one needs a backend on a unique port. The frontend code in these apps is hardcoded to `http://localhost:8000`.
- Use separate terminals for backend and frontend for each app.
- If your system uses `python` as Python 2, use `py -3` instead of `python`.
- If you want, I can also create a PDF version of this file once a PDF generator is available in your environment.
