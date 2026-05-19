from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import uuid
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clear existing data to avoid duplicates on multiple runs
        db.query(models.Claim).delete()
        db.query(models.InsurancePolicy).delete()
        db.query(models.KYC_Document).delete()
        db.query(models.Profile).delete()
        db.query(models.User).delete()

        # Add a test user
        user_id = str(uuid.uuid4())
        test_user = models.User(
            id=user_id,
            email="customer@example.com",
            hashed_password=get_password_hash("Password123!")
        )
        db.add(test_user)

        # Add profile for test user
        profile_id = str(uuid.uuid4())
        test_profile = models.Profile(
            id=profile_id,
            user_id=user_id,
            full_name="Ramesh Kumar",
            date_of_birth="1985-05-15",
            phone="9876543210"
        )
        db.add(test_profile)

        # Add KYC Documents
        kyc_docs = [
            models.KYC_Document(
                id=str(uuid.uuid4()),
                user_id=user_id,
                document_type="aadhaar",
                document_number="123456789012",
                verification_status="verified",
                notes='{"aadhaar_number":"123456789012","full_name":"Ramesh Kumar","date_of_birth":"1985-05-15"}'
            ),
            models.KYC_Document(
                id=str(uuid.uuid4()),
                user_id=user_id,
                document_type="pan",
                document_number="ABCDE1234F",
                verification_status="verified",
                notes='{"pan_number":"ABCDE1234F"}'
            )
        ]
        db.add_all(kyc_docs)

        # Add Insurance Policies
        now = datetime.utcnow()
        policy1_id = str(uuid.uuid4())
        policy2_id = str(uuid.uuid4())
        
        policies = [
            models.InsurancePolicy(
                id=policy1_id,
                user_id=user_id,
                policy_number="POL-HEALTH-001",
                name="Family Health Plus",
                type="Health",
                provider="SecureHealth Life",
                premium=15000.0,
                coverage=500000.0,
                status="Active",
                expiry_date=(now + timedelta(days=365)).strftime("%Y-%m-%d"),
                auto_payment=True,
                payment_method="credit_card"
            ),
            models.InsurancePolicy(
                id=policy2_id,
                user_id=user_id,
                policy_number="POL-AUTO-099",
                name="Comprehensive Car Cover",
                type="Vehicle",
                provider="AutoSafe Insurance",
                premium=8500.0,
                coverage=300000.0,
                status="Expired",
                expiry_date=(now - timedelta(days=10)).strftime("%Y-%m-%d"),
                auto_payment=False,
                payment_method="manual"
            )
        ]
        db.add_all(policies)

        # Add Claims
        claims = [
            models.Claim(
                id=str(uuid.uuid4()),
                policy_id=policy1_id,
                user_id=user_id,
                description="Hospitalization due to viral fever",
                amount=25000.0,
                status="Processing",
                progress=45,
                submitted_at=now - timedelta(days=2)
            ),
            models.Claim(
                id=str(uuid.uuid4()),
                policy_id=policy2_id,
                user_id=user_id,
                description="Minor bumper dent repair",
                amount=5000.0,
                status="Approved",
                progress=100,
                submitted_at=now - timedelta(days=30)
            )
        ]
        db.add_all(claims)

        db.commit()
        print("Customer data seeded successfully!")
        print("Email: customer@example.com")
        print("Password: Password123!")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
