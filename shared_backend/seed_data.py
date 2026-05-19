"""
Run once to seed the demo admin user.
Usage: python -m shared-backend.seed_data
"""
from database import SessionLocal, engine
import models
import uuid
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed manager/admin account
        existing = db.query(models.User).filter(models.User.email == "admin@example.com").first()
        if not existing:
            admin = models.User(
                id=str(uuid.uuid4()),
                email="admin@example.com",
                hashed_password=pwd_context.hash("Password123!"),
                full_name="Regional Manager",
                role="manager",
            )
            db.add(admin)
            db.commit()
            print("[OK] Admin user seeded: admin@example.com / Password123!")
        else:
            print("[OK] Admin user already exists")

        # Seed sample agents if none exist
        if db.query(models.Agent).count() == 0:
            agents = [
                models.Agent(id=str(uuid.uuid4()), 
                             user_id=str(uuid.uuid4()), # Placeholder user_id
                             name="Rajesh Gowda", email="agent1@example.com",
                             home_city="Bengaluru", home_state="Karnataka",
                             latitude=12.9716, longitude=77.5946,
                             availability="available", agent_code="AGT-001"),
                models.Agent(id=str(uuid.uuid4()), 
                             user_id=str(uuid.uuid4()), # Placeholder user_id
                             name="Sneha Patil", email="agent2@example.com",
                             home_city="Mysuru", home_state="Karnataka",
                             latitude=12.2958, longitude=76.6394,
                             availability="available", agent_code="AGT-002"),
            ]
            
            # Also need to create User accounts for these agents so they can login
            for a in agents:
                u = models.User(
                    id=a.user_id,
                    email=a.email,
                    hashed_password=pwd_context.hash("Password123!"),
                    full_name=a.name,
                    role="agent"
                )
                db.add(u)
                db.add(a)
                # Create AgentProfile as well
                db.add(models.AgentProfile(
                    id=str(uuid.uuid4()),
                    user_id=u.id,
                    full_name=u.full_name,
                    email=u.email,
                    city=a.home_city,
                    current_lat=a.latitude,
                    current_lng=a.longitude
                ))
            db.commit()
            print("[OK] Sample agents and their users seeded")

        # Seed sample customer
        if not db.query(models.User).filter(models.User.email == "customer@example.com").first():
            cust_id = str(uuid.uuid4())
            customer = models.User(
                id=cust_id,
                email="customer@example.com",
                hashed_password=pwd_context.hash("Password123!"),
                full_name="Rahul Sharma",
                role="customer",
            )
            db.add(customer)
            db.add(models.Profile(id=str(uuid.uuid4()), user_id=cust_id, full_name="Rahul Sharma", city="Bengaluru"))
            db.commit()
            print("[OK] Sample customer seeded: customer@example.com / Password123!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
