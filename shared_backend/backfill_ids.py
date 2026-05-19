import random
import string
from database import SessionLocal
import models

db = SessionLocal()

def generate_id(model, field):
    while True:
        new_id = "".join(random.choices(string.digits, k=8))
        exists = db.query(model).filter(getattr(model, field) == new_id).first()
        if not exists:
            return new_id

print("Updating Users...")
users = db.query(models.User).filter(models.User.custom_id == None).all()
for u in users:
    u.custom_id = generate_id(models.User, "custom_id")
    print(f"User {u.email} -> {u.custom_id}")

print("\nUpdating Agents...")
agents = db.query(models.Agent).filter(models.Agent.agent_id_8 == None).all()
for a in agents:
    a.agent_id_8 = generate_id(models.Agent, "agent_id_8")
    print(f"Agent {a.email} -> {a.agent_id_8}")

print("\nUpdating Hospital Profiles...")
hps = db.query(models.HospitalProfile).filter(models.HospitalProfile.hospital_id_8 == None).all()
for hp in hps:
    hp.hospital_id_8 = generate_id(models.HospitalProfile, "hospital_id_8")
    print(f"Hospital {hp.hospital_name} -> {hp.hospital_id_8}")

print("\nUpdating Hospitals (Support table)...")
hospitals = db.query(models.Hospital).filter(models.Hospital.hospital_id_8 == None).all()
for h in hospitals:
    h.hospital_id_8 = generate_id(models.Hospital, "hospital_id_8")
    print(f"Hospital {h.name} -> {h.hospital_id_8}")

db.commit()
db.close()
print("\nUpdate complete.")
