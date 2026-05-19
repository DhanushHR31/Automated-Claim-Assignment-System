from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import uuid
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clear existing users
        db.query(models.User).delete()
        
        # Add Admin
        admin_id = str(uuid.uuid4())
        admin = models.User(
            id=admin_id,
            email="admin@example.com",
            hashed_password=get_password_hash("Password123!"),
            full_name="Regional Manager",
            role="manager"
        )
        db.add(admin)
        
        # Add some sample agents if not present
        if db.query(models.Agent).count() == 0:
            agents = [
                models.Agent(
                    id=str(uuid.uuid4()),
                    name="Rajesh Gowda",
                    email="agent1@example.com",
                    home_city="Bengaluru",
                    home_state="Karnataka",
                    latitude=12.9716,
                    longitude=77.5946,
                    availability="available",
                    agent_code="AGT-001"
                ),
                models.Agent(
                    id=str(uuid.uuid4()),
                    name="Sneha Patil",
                    email="agent2@example.com",
                    home_city="Mysuru",
                    home_state="Karnataka",
                    latitude=12.2958,
                    longitude=76.6394,
                    availability="available",
                    agent_code="AGT-002"
                )
            ]
            db.add_all(agents)
            
        db.commit()
        print("Manager data seeded successfully!")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
