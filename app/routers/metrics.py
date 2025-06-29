from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import CampaignMetrics, Campaign
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.post("/", dependencies=[Depends(require_role(["admin", "manager"]))])
def add_metrics(
    data: CampaignMetrics,
    session: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    campaign = session.get(Campaign, data.campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    session.add(data)
    session.commit()
    session.refresh(data)
    return data


@router.get("/campaign/{campaign_id}")
def get_metrics(
    campaign_id: int,
    session: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    metrics_list = session.exec(
        select(CampaignMetrics).where(CampaignMetrics.campaign_id == campaign_id)
    ).all()

    if not metrics_list:
        raise HTTPException(status_code=404, detail="No metrics found")

    enriched = []
    for m in metrics_list:
        ctr = round(m.clicks / m.impressions * 100, 2) if m.impressions else 0
        cr = round(m.conversions / m.clicks * 100, 2) if m.clicks else 0
        enriched.append({
            "id": m.id,
            "timestamp": m.timestamp,
            "impressions": m.impressions,
            "clicks": m.clicks,
            "conversions": m.conversions,
            "CTR (%)": ctr,
            "CR (%)": cr
        })

    return enriched
