from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.config import Settings, get_settings
from app.integrations import Coordinates, KijaniSpaceClient, KijaniSpaceError
from app.repositories import alerts, culture_units, devices, list_feed_plans
from app.schemas.copilot import CopilotAction, CopilotBriefing, CopilotEvidence
from app.services import normalize_water_context
from app.services.kijanispace_normalizer import KijaniPayloadError

router = APIRouter(prefix="/v1/copilot", tags=["copilot"])


@router.get("/briefing", response_model=CopilotBriefing)
async def daily_briefing(
    settings: Annotated[Settings, Depends(get_settings)],
    lat: Annotated[float, Query(ge=-5.1, le=2.5)] = -1.0,
    lon: Annotated[float, Query(ge=28.95, le=36.7)] = 33.0,
) -> CopilotBriefing:
    units = culture_units()
    registered_devices = devices()
    active_alerts = alerts()
    plans = list_feed_plans()
    offline = [device for device in registered_devices if device.status == "offline"]
    due_samples = [unit for unit in units if unit.health_status == "review"]
    priority = "normal"
    headline = "Farm operations are on track"
    summary = f"{len(plans)} feed events are planned across {len(units)} culture units."
    actions = [CopilotAction(label="Review feed plans", href="/feeding")]
    evidence = [CopilotEvidence(label="Feed schedule", value=f"{len(plans)} planned events")]
    if active_alerts or offline or due_samples:
        priority = "attention"
        headline = "Resolve the highest-priority farm issue first"
        issues = len(active_alerts) + len(offline) + len(due_samples)
        summary = (
            f"{issues} operational signal(s) need staff attention "
            "before the next feeding round."
        )
        actions = [CopilotAction(label="Open alerts and devices", href="/devices"), *actions]
        evidence = [
            CopilotEvidence(label="Active alerts", value=str(len(active_alerts))),
            CopilotEvidence(label="Offline devices", value=str(len(offline))),
            CopilotEvidence(label="Samples to review", value=str(len(due_samples))),
        ]
    try:
        password = (
            settings.kijanispace_password.get_secret_value()
            if settings.kijanispace_password
            else None
        )
        if not settings.kijanispace_username or not password:
            raise KijaniSpaceError(503, "KijaniSpace credentials are not configured")
        async with KijaniSpaceClient(
            base_url=settings.kijanispace_api_base_url,
            username=settings.kijanispace_username,
            password=password,
        ) as live_client:
            context = normalize_water_context(
                await live_client.get_water_context(Coordinates(latitude=lat, longitude=lon))
            )
        evidence.append(
            CopilotEvidence(
                label="KijaniSpace context",
                value=f"{context.source} · {context.forecast[0].temperature_mean_c:.1f}°C today",
            )
        )
    except (KijaniSpaceError, KijaniPayloadError):
        evidence.append(
            CopilotEvidence(
                label="KijaniSpace context", value="Unavailable; verify local readings"
            )
        )
    return CopilotBriefing(
        generated_at=datetime.now(UTC), headline=headline, summary=summary,
        priority=priority, confidence="high", actions=actions, evidence=evidence,
    )
