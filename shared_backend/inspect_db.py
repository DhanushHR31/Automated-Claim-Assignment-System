
import sqlite3
import os

db_path = "c:\\Users\\dhanu\\OneDrive\\Desktop\\INSURANCE\\Automated Claim Assignment System\\shared_backend\\insurance.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- Users with role 'hospital' ---")
    cursor.execute("SELECT id, email, role FROM users WHERE role = 'hospital'")
    users = cursor.fetchall()
    for u in users:
        print(u)
        
    print("\n--- Hospital Profiles ---")
    cursor.execute("SELECT * FROM hospital_profiles")
    profiles = cursor.fetchall()
    for p in profiles:
        print(p)
        
    print("\n--- Hospital Claims ---")
    cursor.execute("SELECT id, claim_number, hospital_user_id, claim_status FROM hospital_claims")
    claims = cursor.fetchall()
    for c in claims:
        print(c)
        
    conn.close()
