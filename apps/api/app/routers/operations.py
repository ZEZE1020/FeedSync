from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from psycopg import AsyncConnection

from app.dependencies import get_db_connection
from app.repositories import alerts, create_culture_unit, culture_units, devices
from app.repositories.feed_store import create_feed_plan, list_feed_plans, update_feed_plan
from app.schemas.operations import (
    AlertSummary,
    CultureUnitCreate,
    CultureUnitSummary,
    DeviceSummary,
    FeedPlanCreate,
    FeedPlanSummary,
    FeedPlanUpdate,
)

router = APIRouter(prefix="/v1", tags=["operations"])


@router.get("/culture-units", response_model=list[CultureUnitSummary])
async def list_culture_units(
    kind: Annotated[Literal["cage", "pond"] | None, Query()] = None,
    health: Annotated[Literal["attention", "healthy", "review"] | None, Query()] = None,
) -> list[CultureUnitSummary]:
    items = culture_units()
    if kind:
        items = [item for item in items if item.kind == kind]
    if health:
        items = [item for item in items if item.health_status == health]
    return items


@router.post("/culture-units", response_model=CultureUnitSummary, status_code=201)
async def create_culture_unit_endpoint(payload: CultureUnitCreate) -> CultureUnitSummary:
    return create_culture_unit(payload)


@router.get("/culture-units/{unit_id}", response_model=CultureUnitSummary)
async def get_culture_unit(unit_id: UUID) -> CultureUnitSummary:
    item = next((unit for unit in culture_units() if unit.id == unit_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Culture unit not found")
    return item


@router.get("/feed-plans", response_model=list[FeedPlanSummary])
async def list_feed_plans_endpoint(
    connection: Annotated[AsyncConnection[Any], Depends(get_db_connection)],
    status: Annotated[
        Literal["approved", "awaiting_approval", "draft", "executed", "scheduled"] | None,
        Query(),
    ] = None,
    culture_unit_id: UUID | None = None,
) -> list[FeedPlanSummary]:
    items = await list_feed_plans(connection)
    if status:
        items = [item for item in items if item.status == status]
    if culture_unit_id:
        items = [item for item in items if item.culture_unit_id == culture_unit_id]
    return items


from app.services.email_service import send_email
from app.config import get_settings

@router.post("/feed-plans", response_model=FeedPlanSummary, status_code=201)
async def create_feed_plan_endpoint(
    payload: FeedPlanCreate,
    connection: Annotated[AsyncConnection[Any], Depends(get_db_connection)],
) -> FeedPlanSummary:
    unit = next((item for item in culture_units() if item.id == payload.culture_unit_id), None)
    if unit is None:
        raise HTTPException(status_code=404, detail="Culture unit not found")
    
    new_plan = await create_feed_plan(connection, payload, unit.name)
    
    settings = get_settings()
    if settings.farm_manager_email:
        subject = f"New Feed Plan Created for {unit.name}"
        body = f"""
        A new feed plan has been created for {unit.name}.

        Details:
        - Amount: {new_plan.amount_kg} kg
        - Feed: {new_plan.feed_name}
        - Scheduled for: {new_plan.scheduled_for}

        Please review and approve the plan in the FeedSync application.
        """
        send_email(to_address=settings.farm_manager_email, subject=subject, body=body)
        
    return new_plan


@router.patch("/feed-plans/{plan_id}", response_model=FeedPlanSummary)
async def update_feed_plan_endpoint(
    plan_id: UUID,
    payload: FeedPlanUpdate,
    connection: Annotated[AsyncConnection[Any], Depends(get_db_connection)],
) -> FeedPlanSummary:
    item = await update_feed_plan(connection, plan_id, payload)
    if item is None:
        raise HTTPException(status_code=404, detail="Feed plan not found")
    return item


@router.get("/devices", response_model=list[DeviceSummary])
async def list_devices(
    status: Annotated[Literal["offline", "online"] | None, Query()] = None,
    culture_unit_id: UUID | None = None,
) -> list[DeviceSummary]:
    items = devices()
    if status:
        items = [item for item in items if item.status == status]
    if culture_unit_id:
        items = [item for item in items if item.culture_unit_id == culture_unit_id]
    return items


@router.get("/alerts", response_model=list[AlertSummary])
async def list_alerts(
    severity: Annotated[Literal["attention", "critical", "info"] | None, Query()] = None,
    resolved: bool = False,
) -> list[AlertSummary]:
    items = [item for item in alerts() if item.resolved is resolved]
    if severity:
        items = [item for item in items if item.severity == severity]
    return items