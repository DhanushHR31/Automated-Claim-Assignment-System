from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import uuid
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_db():
    models.Base.metadata.drop_all(bind=engine) # Start fresh
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Create Users
    users = [
        {
            "id": "agent_user_1",
            "email": "agent@example.com",
            "password": "Password123!",
            "full_name": "Agent Dhanush",
            "role": "agent"
        },
        {
            "id": "admin_user_1",
            "email": "admin@example.com",
            "password": "Password123!",
            "full_name": "Manager Prabhu",
            "role": "manager"
        }
    ]

    for u in users:
        db_user = models.User(
            id=u["id"],
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            full_name=u["full_name"],
            role=u["role"]
        )
        db.add(db_user)
        
        # Create Profiles
        profile = models.Profile(
            id=str(uuid.uuid4()),
            user_id=u["id"],
            full_name=u["full_name"],
            phone="9876543210" if u["role"] == "agent" else "9000000000",
            email=u["email"],
            is_online=True,
            city="Bengaluru",
            district="Bengaluru South"
        )
        db.add(profile)

    # Create Claims
    claims = [
        models.Claim(
            id=str(uuid.uuid4()),
            claim_number="CLM-001",
            claim_type="vehicle",
            priority="high",
            status="assigned",
            customer_name="John Doe",
            customer_phone="9000000001",
            policy_number="POL-101",
            incident_description="Front bumper damage due to collision.",
            claim_amount=15000.0,
            location_address="Bannerghatta Road, Bengaluru",
            location_lat=12.8950,
            location_lng=77.5950,
            district="Bengaluru South",
            assigned_agent_id=None # Available in queue
        ),
        models.Claim(
            id=str(uuid.uuid4()),
            claim_number="CLM-002",
            claim_type="health",
            priority="emergency",
            status="assigned",
            customer_name="Jane Smith",
            customer_phone="9000000002",
            policy_number="POL-102",
            incident_description="Emergency hospitalization required.",
            claim_amount=50000.0,
            location_address="Jayanagar 4th Block, Bengaluru",
            location_lat=12.9250,
            location_lng=77.5850,
            district="Bengaluru South",
            assigned_agent_id="agent_user_1", # Already assigned to agent
            assigned_at=datetime.utcnow()
        )
    ]
    
    for claim in claims:
        db.add(claim)
    
    db.commit()
    print("Database seeded successfully with local auth users:")
    print("Agent: agent@example.com / Password123!")
    print("Admin: admin@example.com / Password123!")

if __name__ == "__main__":
    seed_db()
