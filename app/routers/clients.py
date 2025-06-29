from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Client
from app.auth import get_current_user
from app.auth import require_role

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/")
def create_client(
    client: Client,
    session: Session = Depends(get_session),
    user=Depends(require_role(["admin", "manager"]))  # только admin и manager
):
    session.add(client)
    session.commit()
    session.refresh(client)
    return client

@router.get("/")
def read_clients(session: Session = Depends(get_session), user=Depends(get_current_user)):
    return session.exec(select(Client)).all()

