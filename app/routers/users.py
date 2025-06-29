from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel
from datetime import timedelta

from app.models import User
from app.database import get_session
from app.auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_role
)

router = APIRouter(prefix="/users", tags=["Users"])

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "manager"

@router.post("/register", dependencies=[Depends(require_role(["admin"]))])
def register_user(user: UserCreate, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.username == user.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    db_user = User(
        username=user.username,
        hashed_password=hash_password(user.password),
        role=user.role
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return {"message": "User registered successfully"}

@router.post("/token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        {"sub": user.username},
        expires_delta=timedelta(minutes=30)
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role
    }
