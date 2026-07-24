from datetime import UTC, date, datetime
from typing import Any

from pydantic import BaseModel, Field, TypeAdapter, ValidationError

from app.schemas.context import (
    CoordinatesResponse,
    DataSource,
    ForecastDay,
    LocationProductMap,
    WaterContextResponse,
    WaterStaticContext,
)


class KijaniPayloadError(ValueError):
    """Raised when the provider response no longer matches the observed contract."""


class _WaterLocation(BaseModel):
    latitude: float
    longitude: float
    timezone: str


class _WaterStatic(BaseModel):
    water_body_percentage: float
    diffuse_attenuation: float | None = Field(
        default=None,
        alias="diffuse_attenuation_coefficient_at_490_nm(monthly_climatology)",
    )
    monthly_temperature: float | None = Field(
        default=None,
        alias="lake_water_temperature(monthly_climatology)",
    )
    chlorophyll: float | None = Field(
        default=None,
        alias="chlorophyll_a_concentration(8day_climatology)",
    )
    bathymetry_depth: float | None = None


class _WaterForecast(BaseModel):
    time: list[date]
    temperature_mean: list[float]
    temperature_max: list[float]
    temperature_min: list[float]
    windspeed_mean: list[float]
    windspeed_max: list[float]
    windspeed_min: list[float]
    precipitation: list[float]


class _WaterPayload(BaseModel):
    location: _WaterLocation
    static_data: _WaterStatic
    forecast_data: _WaterForecast
    source: str


def normalize_water_context(payload: Any) -> WaterContextResponse:
    try:
        upstream = _WaterPayload.model_validate(payload)
    except ValidationError as error:
        raise KijaniPayloadError(
            "KijaniSpace water response did not match its observed schema"
        ) from error

    forecast = upstream.forecast_data
    expected_length = len(forecast.time)
    series = {
        "temperature_mean": forecast.temperature_mean,
        "temperature_max": forecast.temperature_max,
        "temperature_min": forecast.temperature_min,
        "windspeed_mean": forecast.windspeed_mean,
        "windspeed_max": forecast.windspeed_max,
        "windspeed_min": forecast.windspeed_min,
        "precipitation": forecast.precipitation,
    }
    mismatched = [name for name, values in series.items() if len(values) != expected_length]
    if mismatched:
        raise KijaniPayloadError(
            f"KijaniSpace water forecast series length mismatch: {', '.join(mismatched)}"
        )

    days = [
        ForecastDay(
            date=forecast.time[index],
            temperature_mean_c=forecast.temperature_mean[index],
            temperature_min_c=forecast.temperature_min[index],
            temperature_max_c=forecast.temperature_max[index],
            windspeed_mean_m_s=forecast.windspeed_mean[index],
            windspeed_min_m_s=forecast.windspeed_min[index],
            windspeed_max_m_s=forecast.windspeed_max[index],
            precipitation_mm=forecast.precipitation[index],
        )
        for index in range(expected_length)
    ]

    static = upstream.static_data
    location = upstream.location
    return WaterContextResponse(
        coordinates=CoordinatesResponse(
            latitude=location.latitude,
            longitude=location.longitude,
        ),
        timezone=location.timezone,
        source=upstream.source,
        retrieved_at=datetime.now(UTC),
        static=WaterStaticContext(
            water_body_percentage=static.water_body_percentage,
            monthly_climatology_temperature_c=static.monthly_temperature,
            diffuse_attenuation_coefficient_m_1=static.diffuse_attenuation,
            chlorophyll_a_concentration_mg_m3=static.chlorophyll,
            bathymetry_depth_m=static.bathymetry_depth,
        ),
        forecast=days,
    )


def normalize_datasources(payload: Any) -> list[DataSource]:
    try:
        return TypeAdapter(list[DataSource]).validate_python(payload)
    except ValidationError as error:
        raise KijaniPayloadError(
            "KijaniSpace datasource response did not match its OpenAPI schema"
        ) from error


def normalize_locations(payload: Any) -> dict[str, LocationProductMap]:
    try:
        return TypeAdapter(dict[str, LocationProductMap]).validate_python(payload)
    except ValidationError as error:
        raise KijaniPayloadError(
            "KijaniSpace location response did not match its observed schema"
        ) from error
