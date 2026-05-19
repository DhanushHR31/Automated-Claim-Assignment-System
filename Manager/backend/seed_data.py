from database import SessionLocal, init_db
import crud
from schemas import UserCreate, AgentCreate, ClaimCreate
from models import UserRole
from datetime import datetime
import random

def seed_database():
    """Seed the database with initial data"""
    init_db()
    db = SessionLocal()
    
    try:
        # Create admin user
        admin_user = UserCreate(
            email="admin@example.com",
            username="admin",
            full_name="Admin User",
            password="admin123",
            role=UserRole.ADMIN
        )
        crud.create_user(db, admin_user)
        print("✓ Created admin user")
        
        # Create manager users
        for i in range(2):
            manager_user = UserCreate(
                email=f"manager{i+1}@example.com",
                username=f"manager{i+1}",
                full_name=f"Manager {i+1}",
                password="manager123",
                role=UserRole.MANAGER
            )
            crud.create_user(db, manager_user)
        print("✓ Created manager users")
        
        # Create agent users and profiles
        specializations = ["Auto Claims", "Health Claims", "Property Claims", "Liability Claims"]
        agent_users = []
        
        for i in range(5):
            agent_user = UserCreate(
                email=f"agent{i+1}@example.com",
                username=f"agent{i+1}",
                full_name=f"Agent {i+1}",
                password="agent123",
                role=UserRole.AGENT
            )
            user = crud.create_user(db, agent_user)
            agent_users.append(user)
            
            agent_data = AgentCreate(
                user_id=user.id,
                specialization=specializations[i % len(specializations)],
                experience_years=random.randint(1, 15),
                bio=f"Experienced claims adjuster specializing in {specializations[i % len(specializations)]}"
            )
            crud.create_agent(db, agent_data)
        
        print("✓ Created agent users and profiles")
        
        # Create sample claims
        claim_types = ["Auto", "Health", "Property", "Liability", "Workers Compensation"]
        priorities = ["low", "medium", "high", "urgent"]
        
        for i in range(20):
            claim_data = ClaimCreate(
                policy_number=f"POL-2024-{i+1:05d}",
                customer_name=f"Customer {i+1}",
                customer_email=f"customer{i+1}@example.com",
                claim_type=random.choice(claim_types),
                amount=random.uniform(1000, 50000),
                description=f"Sample claim description for claim #{i+1}",
                priority=random.choice(priorities)
            )
            claim = crud.create_claim(db, claim_data)
            
            # Assign some claims to agents
            if i % 3 == 0 and agent_users:
                agent = random.choice(agent_users)
                agent_profile = crud.get_agent_by_user(db, agent.id)
                if agent_profile:
                    claim.assigned_agent_id = agent_profile.id
                    db.add(claim)
                    db.commit()
        
        print("✓ Created sample claims")
        
        print("\n✅ Database seeding completed successfully!")
        print("\nDefault credentials:")
        print("  Admin: admin / admin123")
        print("  Manager: manager1 / manager123")
        print("  Agent: agent1 / agent123")
        
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
