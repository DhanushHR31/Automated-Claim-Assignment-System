import sqlite3
import os

db_path = r"c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\shared_backend\insurance.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Customers ---")
cursor.execute("SELECT id, email, custom_id FROM users WHERE role='customer'")
for row in cursor.fetchall():
    print(row)

print("\n--- Hospital Profiles ---")
cursor.execute("SELECT id, user_id, hospital_name, hospital_id_8 FROM hospital_profiles")
for row in cursor.fetchall():
    print(row)

conn.close()
