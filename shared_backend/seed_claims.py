
import sqlite3
import uuid
from datetime import datetime

db_path = "insurance.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Ensure a hospital user exists
hospital_user_id = '7a21bb93-a428-467a-a35a-458d25db3933' # admin@example.com (currently manager)
# Let's change admin to 'hospital' role for testing if we want, or just create a new one.
# For now, let's just make sure a profile exists for this ID (it does).

# 2. Add some claims for this hospital
claims = [
    (str(uuid.uuid4()), "CLM-HOSP-001", hospital_user_id, "Apollo Hospital", "John Doe", "Heart Surgery", 500000, "submitted", datetime.now().isoformat()),
    (str(uuid.uuid4()), "CLM-HOSP-002", hospital_user_id, "Apollo Hospital", "Jane Smith", "Fracture", 45000, "approved", datetime.now().isoformat()),
    (str(uuid.uuid4()), "CLM-HOSP-003", hospital_user_id, "Apollo Hospital", "Bob Wilson", "Fever", 5000, "paid", datetime.now().isoformat()),
]

for c in claims:
    cursor.execute("""
        INSERT INTO hospital_claims (id, claim_number, hospital_user_id, hospital_name, patient_name, diagnosis, estimated_amount, claim_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, c)

conn.commit()
print(f"Added {len(claims)} test claims for hospital {hospital_user_id}")
conn.close()
