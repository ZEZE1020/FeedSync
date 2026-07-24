from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field, HttpUrl


class CoordinatesResponse(BaseModel):
    latitude: float
    longitude: float


class ForecastDay(BaseModel):
    date: date
    temperature_mean_c: float
    temperature_min_c: float
    temperature_max_c: float
    windspeed_mean_m_s: float
    windspeed_min_m_s: float
    windspeed_max_m_s: float
    precipitation_mm: float


class WaterStaticContext(BaseModel):
    water_body_percentage: float = Field(ge=0, le=100)
    monthly_climatology_temperature_c: float | None = None
    diffuse_attenuation_coefficient_m_1: float | None = None
    chlorophyll_a_concentration_mg_m3: float | None = None
    bathymetry_depth_m: float | None = None


class WaterContextResponse(BaseModel):
    coordinates: CoordinatesResponse
    timezone: str
    source: str
    retrieved_at: datetime
    static: WaterStaticContext
    forecast: list[ForecastDay]


class DataSource(BaseModel):
    identifier: int
    title: str
    subject: str
    description: str
    source: HttpUrl
    training_doc: str | None = None
    variables: list[str]
    publisher: str
    date: datetime
    format: str
    language: str
    coverage: str
    domain: list[str]


class DataSourceListResponse(BaseModel):
    items: list[DataSource]
    total: int
    applied_domains: list[str]
    source: str = "kijanispace"


class ProductAvailability(BaseModel):
    dates: list[date]


LocationProductMap = dict[str, ProductAvailability]


class LocationCatalogResponse(BaseModel):
    locations: dict[str, LocationProductMap]
    source: str = "kijanispace"


class LandContextResponse(BaseModel):
    """Land data remains provider-shaped until the farm UI selects a stable subset."""

    data: dict[str, Any]
    source: str = "kijanispace"
