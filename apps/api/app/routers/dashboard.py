from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.dependencies import get_kijanispace_client
from app.integrations import Coordinates, KijaniSpaceClient, KijaniSpaceError
from app.repositories import alerts, culture_units, devices, list_feed_plans
from app.schemas.operations import DashboardMetrics, DashboardSummary
from app.services import normalize_water_context
from app.services.kijanispace_normalizer import KijaniPayloadError

router = APIRouter(prefix="/v1/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def dashboard_summary(
    client: Annotated[KijaniSpaceClient, Depends(get_kijanispace_client)],
    lat: Annotated[float, Query(ge=-5.1, le=2.5)] = -1.0,
    lon: Annotated[float, Query(ge=28.95, le=36.7)] = 33.0,
) -> DashboardSummary:
    units = culture_units()
    plans = list_feed_plans()
    registered_devices = devices()
    water_context = None
    context_error = None

    try:
        payload = await client.get_water_context(Coordinates(latitude=lat, longitude=lon))
        water_context = normalize_water_context(payload)
    except (KijaniSpaceError, KijaniPayloadError):
        context_error = "Live KijaniSpace water context is currently unavailable"

    return DashboardSummary(
        generated_at=plans[0].scheduled_for if plans else datetime.now(UTC),
        metrics=DashboardMetrics(
            feed_planned_kg=round(sum(plan.amount_kg for plan in plans), 1),
            scheduled_feed_events=len(plans),
            active_culture_units=len(units),
            pond_count=sum(unit.kind == "pond" for unit in units),
            cage_count=sum(unit.kind == "cage" for unit in units),
            online_devices=sum(device.status == "online" for device in registered_devices),
            total_devices=len(registered_devices),
        ),
        water_context=water_context,
        context_error=context_error,
        alerts=alerts(),
        upcoming_feedings=plans[:3],
    )
