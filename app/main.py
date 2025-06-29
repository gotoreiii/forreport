from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import SQLModel
from app.routers import clients, users, campaigns, analytics, metrics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

app.include_router(clients.router)
app.include_router(users.router)
app.include_router(campaigns.router)
app.include_router(analytics.router)
app.include_router(metrics.router)
