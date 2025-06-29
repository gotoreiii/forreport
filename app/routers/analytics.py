from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.database import get_session
from app.models import Campaign
from app.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/client/{client_id}/total-budget")
def get_total_budget(client_id: int, session: Session = Depends(get_session), user=Depends(get_current_user)):
    total_budget = session.exec(
        select(func.sum(Campaign.budget)).where(Campaign.client_id == client_id)
    ).first()

    if total_budget is None:
        raise HTTPException(status_code=404, detail="No campaigns found for this client")

    return {
        "client_id": client_id,
        "total_budget": total_budget or 0
    }
