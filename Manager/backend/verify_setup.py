#!/usr/bin/env python3
"""
Quick verification script for Agent Command Center setup
Checks if all dependencies are installed and database is ready
"""

import sys
import os

def check_python_version():
    """Check Python version"""
    print("✓ Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"  ✗ Python 3.8+ required, found {version.major}.{version.minor}")
        return False
    print(f"  ✓ Python {version.major}.{version.minor} is OK")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    print("\n✓ Checking dependencies...")
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic',
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"  ✓ {package} installed")
        except ImportError:
            print(f"  ✗ {package} NOT installed")
            missing.append(package)
    
    return len(missing) == 0

def check_database():
    """Check if database exists"""
    print("\n✓ Checking database...")
    db_path = "agent_command_center.db"
    if os.path.exists(db_path):
        size = os.path.getsize(db_path)
        print(f"  ✓ Database found ({size} bytes)")
        return True
    else:
        print(f"  ✗ Database not found at {db_path}")
        return False

def check_env_files():
    """Check if .env files exist"""
    print("\n✓ Checking environment files...")
    
    files_to_check = [
        ('.env', 'Backend'),
        ('../.env', 'Frontend'),
    ]
    
    all_exist = True
    for filepath, name in files_to_check:
        if os.path.exists(filepath):
            print(f"  ✓ {name} .env found")
        else:
            print(f"  ✗ {name} .env not found at {filepath}")
            all_exist = False
    
    return all_exist

def main():
    """Run all checks"""
    print("=" * 50)
    print("Agent Command Center - Setup Verification")
    print("=" * 50)
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Database", check_database),
        ("Environment Files", check_env_files),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"  ✗ Error checking {name}: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 50)
    print("Verification Summary:")
    print("=" * 50)
    
    all_passed = True
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
        if not result:
            all_passed = False
    
    print("=" * 50)
    
    if all_passed:
        print("\n✅ All checks passed! Ready to run:")
        print("  1. Terminal 1: python -m uvicorn main:app --reload")
        print("  2. Terminal 2: npm run dev")
    else:
        print("\n❌ Some checks failed. Please fix the issues above.")
        print("\nQuick fixes:")
        print("  - Missing dependencies: pip install -r requirements.txt")
        print("  - Missing database: python seed_data.py")
        print("  - Missing .env files: cp .env.example .env")
        sys.exit(1)

if __name__ == "__main__":
    main()
