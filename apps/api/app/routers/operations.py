from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from app.repositories import alerts, culture_units, devices, feed_plans
from app.schemas.operations import AlertSummary, CultureUnitSummary, DeviceSummary, FeedPlanSummary

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


@router.get("/culture-units/{unit_id}", response_model=CultureUnitSummary)
async def get_culture_unit(unit_id: UUID) -> CultureUnitSummary:
    item = next((unit for unit in culture_units() if unit.id == unit_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Culture unit not found")
    return item


@router.get("/feed-plans", response_model=list[FeedPlanSummary])
async def list_feed_plans(
    status: Annotated[
        Literal["approved", "awaiting_approval", "draft", "executed", "scheduled"] | None,
        Query(),
    ] = None,
    culture_unit_id: UUID | None = None,
) -> list[FeedPlanSummary]:
    items = sorted(feed_plans(), key=lambda item: item.scheduled_for)
    if status:
        items = [item for item in items if item.status == status]
    if culture_unit_id:
        items = [item for item in items if item.culture_unit_id == culture_unit_id]
    return items


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
