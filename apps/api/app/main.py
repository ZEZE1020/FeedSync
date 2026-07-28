from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import lifespan
from app.routers import (
    context_router,
    copilot_router,
    dashboard_router,
    operations_router,
    users_router,
    farms_router,
)

settings = get_settings()

app = FastAPI(
    title="Feed Sync API",
    description="Decision-support API for cage and pond fish farming.",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(context_router)
app.include_router(dashboard_router)
app.include_router(operations_router)
app.include_router(copilot_router)
app.include_router(users_router)
app.include_router(farms_router)


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"service": "feed-sync-api", "status": "ok"}
