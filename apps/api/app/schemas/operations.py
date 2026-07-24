from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.context import WaterContextResponse

CultureKind = Literal["cage", "pond"]
HealthStatus = Literal["attention", "healthy", "review"]


class CultureUnitSummary(BaseModel):
    id: UUID
    farm_id: UUID
    name: str
    kind: CultureKind
    species: str
    stocked_fish_count: int = Field(gt=0)
    estimated_biomass_kg: float = Field(gt=0)
    geometry_label: str
    latest_temperature_c: float | None = None
    health_status: HealthStatus
    sample_due_at: datetime | None = None


class FeedPlanSummary(BaseModel):
    id: UUID
    culture_unit_id: UUID
    culture_unit_name: str
    scheduled_for: datetime
    amount_kg: float = Field(gt=0)
    feed_name: str
    owner_name: str
    status: Literal["approved", "awaiting_approval", "draft", "executed", "scheduled"]
    rationale: list[str]


class FeedPlanCreate(BaseModel):
    culture_unit_id: UUID
    scheduled_for: datetime
    amount_kg: float = Field(gt=0, le=500)
    feed_name: str = Field(min_length=2, max_length=120)
    owner_name: str = Field(min_length=2, max_length=120)
    rationale: list[str] = Field(default_factory=list, max_length=6)


class FeedPlanUpdate(BaseModel):
    status: Literal["approved", "awaiting_approval", "draft", "executed", "scheduled"] | None = None
    actual_amount_kg: float | None = Field(default=None, gt=0, le=500)


class DeviceSummary(BaseModel):
    id: UUID
    culture_unit_id: UUID
    culture_unit_name: str
    name: str
    kind: Literal["dissolved_oxygen", "feeder_controller", "water_monitor"]
    status: Literal["offline", "online"]
    latest_state: str
    battery_label: str
    last_seen_at: datetime


class AlertSummary(BaseModel):
    id: UUID
    culture_unit_id: UUID
    culture_unit_name: str
    title: str
    detail: str
    severity: Literal["attention", "critical", "info"]
    created_at: datetime
    resolved: bool = False


class DashboardMetrics(BaseModel):
    feed_planned_kg: float
    scheduled_feed_events: int
    active_culture_units: int
    pond_count: int
    cage_count: int
    online_devices: int
    total_devices: int


class DashboardSummary(BaseModel):
    generated_at: datetime
    data_mode: Literal["operational"] = "operational"
    metrics: DashboardMetrics
    water_context: WaterContextResponse | None
    context_error: str | None = None
    alerts: list[AlertSummary]
    upcoming_feedings: list[FeedPlanSummary]
