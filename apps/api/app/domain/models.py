from datetime import UTC, datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, Field, PositiveFloat, PositiveInt


class PondProfile(BaseModel):
    kind: Literal["pond"] = "pond"
    surface_area_m2: PositiveFloat
    average_depth_m: PositiveFloat
    water_source: str | None = None


class CageProfile(BaseModel):
    kind: Literal["cage"] = "cage"
    volume_m3: PositiveFloat
    site_depth_m: PositiveFloat
    mesh_size_mm: PositiveFloat | None = None


CultureSystemProfile = Annotated[PondProfile | CageProfile, Field(discriminator="kind")]


class CultureUnit(BaseModel):
    """A stocked production unit, represented as either a pond or a cage."""

    id: UUID
    farm_id: UUID
    name: str = Field(min_length=1, max_length=100)
    species: str = Field(min_length=1, max_length=100)
    stocked_fish_count: PositiveInt
    profile: CultureSystemProfile


class WaterObservation(BaseModel):
    culture_unit_id: UUID
    observed_at: datetime
    source: Literal["arduino", "kijanispace", "manual"]
    temperature_celsius: float | None = None
    dissolved_oxygen_mg_l: float | None = Field(default=None, ge=0)
    ph: float | None = Field(default=None, ge=0, le=14)
    water_current_m_s: float | None = Field(default=None, ge=0)


class FeedingPlan(BaseModel):
    culture_unit_id: UUID
    scheduled_for: datetime
    amount_grams: PositiveFloat
    rationale: list[str] = Field(min_length=1)
    confidence: Literal["low", "medium", "high"]
    status: Literal["draft", "approved", "executed", "skipped"] = "draft"
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class FeederCommand(BaseModel):
    command_id: UUID
    culture_unit_id: UUID
    issued_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    duration_ms: int = Field(gt=0, le=5_000)
