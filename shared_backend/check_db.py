import sqlite3
import os

db_path = r"c:\Users\dhanu\OneDrive\Desktop\INSURANCE\Automated Claim Assignment System\shared_backend\insurance.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()
for col in columns:
    print(col)
conn.close()
