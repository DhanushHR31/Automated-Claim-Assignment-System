import sqlite3
import os

db_path = r"c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\shared_backend\insurance.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_column_if_not_exists(table, column, type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type}")
        print(f"[OK] Added column {column} to table {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"Column {column} already exists in table {table}")
        else:
            print(f"Error adding {column} to {table}: {e}")

# Add missing 8-digit ID columns
add_column_if_not_exists("users", "custom_id", "TEXT")
add_column_if_not_exists("agents", "agent_id_8", "TEXT")
add_column_if_not_exists("hospitals", "hospital_id_8", "TEXT")
add_column_if_not_exists("hospital_profiles", "hospital_id_8", "TEXT")

conn.commit()
conn.close()
print("Database fix completed.")
