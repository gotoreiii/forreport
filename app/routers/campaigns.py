import csv
import io
from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Campaign
from app.auth import get_current_user, require_role
from app.notifications import send_telegram_message

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.post("/", dependencies=[Depends(require_role(["admin", "manager"]))])
def create_campaign(campaign: Campaign, session: Session = Depends(get_session), user=Depends(get_current_user)):
    session.add(campaign)
    session.commit()
    session.refresh(campaign)

    send_telegram_message(
        f"📢 <b>Новая кампания создана</b>\n"
        f"Название: {campaign.name}\n"
        f"Клиент: {campaign.client_id}\n"
        f"Бюджет: ${campaign.budget}\n"
        f"Статус: {campaign.status}"
    )

    return campaign

@router.get("/")
def read_campaigns(
    status: str = None,
    client_id: int = None,
    sort_by: str = None, 
    order: str = "asc",
    session: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    query = select(Campaign)

    if status:
        query = query.where(Campaign.status == status)
    if client_id:
        query = query.where(Campaign.client_id == client_id)

    if sort_by in {"budget", "created_at"}:
        column = getattr(Campaign, sort_by)
        if order == "desc":
            column = column.desc()
        query = query.order_by(column)

    return session.exec(query).all()

@router.put("/{campaign_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
def update_campaign(campaign_id: int, updated: Campaign, session: Session = Depends(get_session), user=Depends(get_current_user)):
    campaign = session.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    for field, value in updated.dict(exclude_unset=True).items():
        setattr(campaign, field, value)
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    return campaign

@router.delete("/{campaign_id}", dependencies=[Depends(require_role(["admin"]))])
def delete_campaign(campaign_id: int, session: Session = Depends(get_session), user=Depends(get_current_user)):
    campaign = session.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    session.delete(campaign)
    session.commit()
    return {"message": "Campaign deleted"}

@router.get("/export")
def export_campaigns(session: Session = Depends(get_session), user=Depends(get_current_user)):
    campaigns = session.exec(select(Campaign)).all()

    if not campaigns:
        raise HTTPException(status_code=404, detail="No campaigns found")

    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["ID", "Name", "Client ID", "Status", "Budget", "Created At"])

    for c in campaigns:
        writer.writerow([c.id, c.name, c.client_id, c.status, c.budget, c.created_at])

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=campaigns.csv"}
    )
