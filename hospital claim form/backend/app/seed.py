"""Seed insurance companies and policies on first run."""
from datetime import date
from app import models


COMPANIES = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "company_name": "Apex Health Insurance",
        "contact_email": "claims@apexhealth.in",
        "contact_phone": "+91-1800-123-456",
        "address": "Mumbai, India",
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "company_name": "SecureLife Insurance",
        "contact_email": "support@securelife.in",
        "contact_phone": "+91-1800-456-789",
        "address": "Bengaluru, India",
    },
]

POLICIES = [
    {
        "policy_number": "POL-1001",
        "customer_name": "Rahul Sharma",
        "aadhaar_number": "1234-5678-9012",
        "pan_number": "ABCDE1234F",
        "contact_number": "+91-9876543210",
        "email": "rahul@example.com",
        "company_id": "11111111-1111-1111-1111-111111111111",
        "policy_type": models.PolicyType.individual,
        "coverage_amount": 500000,
        "start_date": date(2025, 1, 1),
        "end_date": date(2027, 1, 1),
        "status": models.PolicyStatus.active,
        "corporate_company_name": None,
    },
    {
        "policy_number": "POL-1002",
        "customer_name": "Priya Verma",
        "aadhaar_number": "2234-5678-9012",
        "pan_number": "BBCDE1234F",
        "contact_number": "+91-9876543211",
        "email": "priya@example.com",
        "company_id": "11111111-1111-1111-1111-111111111111",
        "policy_type": models.PolicyType.individual,
        "coverage_amount": 300000,
        "start_date": date(2025, 6, 15),
        "end_date": date(2026, 6, 15),
        "status": models.PolicyStatus.active,
        "corporate_company_name": None,
    },
    {
        "policy_number": "POL-1003",
        "customer_name": "Amit Patel",
        "aadhaar_number": "3234-5678-9012",
        "pan_number": "CBCDE1234F",
        "contact_number": "+91-9876543212",
        "email": "amit@example.com",
        "company_id": "22222222-2222-2222-2222-222222222222",
        "policy_type": models.PolicyType.corporate,
        "coverage_amount": 1000000,
        "start_date": date(2025, 4, 1),
        "end_date": date(2027, 4, 1),
        "status": models.PolicyStatus.active,
        "corporate_company_name": "Tata Consultancy Services",
    },
    {
        "policy_number": "POL-1004",
        "customer_name": "Sneha Iyer",
        "aadhaar_number": "4234-5678-9012",
        "pan_number": "DBCDE1234F",
        "contact_number": "+91-9876543213",
        "email": "sneha@example.com",
        "company_id": "22222222-2222-2222-2222-222222222222",
        "policy_type": models.PolicyType.individual,
        "coverage_amount": 200000,
        "start_date": date(2022, 1, 1),
        "end_date": date(2024, 1, 1),
        "status": models.PolicyStatus.expired,
        "corporate_company_name": None,
    },
    {
        "policy_number": "POL-1005",
        "customer_name": "Vikram Singh",
        "aadhaar_number": "5234-5678-9012",
        "pan_number": "EBCDE1234F",
        "contact_number": "+91-9876543214",
        "email": "vikram@example.com",
        "company_id": "11111111-1111-1111-1111-111111111111",
        "policy_type": models.PolicyType.corporate,
        "coverage_amount": 750000,
        "start_date": date(2025, 3, 1),
        "end_date": date(2026, 3, 1),
        "status": models.PolicyStatus.active,
        "corporate_company_name": "Infosys Limited",
    },
]


def run_seed(db):
    for c in COMPANIES:
        exists = db.query(models.InsuranceCompany).filter_by(id=c["id"]).first()
        if not exists:
            db.add(models.InsuranceCompany(**c))

    for p in POLICIES:
        exists = db.query(models.Policy).filter_by(policy_number=p["policy_number"]).first()
        if not exists:
            db.add(models.Policy(**p))

    db.commit()
