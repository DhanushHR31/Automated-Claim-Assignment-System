import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, get_current_hospital

router = APIRouter(prefix="/support", tags=["support"])


@router.get("/tickets", response_model=list[schemas.TicketOut])
def list_tickets(
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.SupportTicket)
        .filter(models.SupportTicket.hospital_id == hospital.id)
        .order_by(models.SupportTicket.created_at.desc())
        .all()
    )


@router.post("/tickets", response_model=schemas.TicketOut, status_code=201)
def create_ticket(
    body: schemas.TicketCreate,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    ticket = models.SupportTicket(
        id=str(uuid.uuid4()),
        hospital_id=hospital.id,
        subject=body.subject,
        issue=body.issue,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/tickets/{ticket_id}/messages", response_model=list[schemas.MessageOut])
def list_messages(
    ticket_id: str,
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    ticket = db.query(models.SupportTicket).filter(
        models.SupportTicket.id == ticket_id,
        models.SupportTicket.hospital_id == hospital.id,
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return (
        db.query(models.SupportMessage)
        .filter(models.SupportMessage.ticket_id == ticket_id)
        .order_by(models.SupportMessage.sent_at)
        .all()
    )


@router.post("/tickets/{ticket_id}/messages", response_model=schemas.MessageOut, status_code=201)
def send_message(
    ticket_id: str,
    body: schemas.MessageCreate,
    current_user: models.User = Depends(get_current_user),
    hospital: models.Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    ticket = db.query(models.SupportTicket).filter(
        models.SupportTicket.id == ticket_id,
        models.SupportTicket.hospital_id == hospital.id,
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    msg = models.SupportMessage(
        id=str(uuid.uuid4()),
        ticket_id=ticket_id,
        sender_id=current_user.id,
        sender_role="hospital",
        message=body.message,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
