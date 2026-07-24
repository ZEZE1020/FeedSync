from typing import Any

import httpx
import pytest

from app.dependencies import get_kijanispace_client
from app.main import app

WATER_PAYLOAD: dict[str, Any] = {
    "location": {"latitude": -1.0, "longitude": 33.0, "timezone": "EAT"},
    "static_data": {
        "water_body_percentage": 100.0,
        "diffuse_attenuation_coefficient_at_490_nm(monthly_climatology)": 0.95,
        "lake_water_temperature(monthly_climatology)": 24.09,
        "chlorophyll_a_concentration(8day_climatology)": None,
        "bathymetry_depth": 68.4,
    },
    "forecast_data": {
        "time": ["2026-07-24", "2026-07-25"],
        "temperature_mean": [24.67, 24.84],
        "temperature_max": [25.16, 25.43],
        "temperature_min": [24.18, 24.42],
        "windspeed_mean": [2.09, 3.45],
        "windspeed_max": [3.09, 5.2],
        "windspeed_min": [0.68, 2.37],
        "precipitation": [0.0, 0.0],
    },
    "source": "meteoblue",
}


class FakeKijaniSpaceClient:
    async def get_water_context(self, coordinates: Any) -> dict[str, Any]:
        assert coordinates.latitude == -1.0
        assert coordinates.longitude == 33.0
        return WATER_PAYLOAD


async def override_client() -> FakeKijaniSpaceClient:
    return FakeKijaniSpaceClient()


@pytest.fixture(autouse=True)
def override_kijanispace_client() -> None:
    app.dependency_overrides[get_kijanispace_client] = override_client
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_health() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"service": "feed-sync-api", "status": "ok"}


@pytest.mark.asyncio
async def test_water_context_is_normalized_for_the_ui() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/v1/context/water?lat=-1.0&lon=33.0")

    assert response.status_code == 200
    body = response.json()
    assert body["source"] == "meteoblue"
    assert body["static"]["bathymetry_depth_m"] == 68.4
    assert body["forecast"][0]["temperature_mean_c"] == 24.67


@pytest.mark.asyncio
async def test_dashboard_summary_matches_ui_metrics() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/v1/dashboard/summary")

    assert response.status_code == 200
    body = response.json()
    assert body["data_mode"] == "demo"
    assert body["metrics"] == {
        "feed_planned_kg": 48.2,
        "scheduled_feed_events": 6,
        "active_culture_units": 8,
        "pond_count": 3,
        "cage_count": 5,
        "online_devices": 6,
        "total_devices": 7,
    }
    assert len(body["alerts"]) == 2
    assert len(body["upcoming_feedings"]) == 3


@pytest.mark.asyncio
async def test_operations_support_ui_filters() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        cages = await client.get("/v1/culture-units?kind=cage")
        offline_devices = await client.get("/v1/devices?status=offline")
        approvals = await client.get("/v1/feed-plans?status=awaiting_approval")

    assert cages.status_code == 200
    assert len(cages.json()) == 5
    assert len(offline_devices.json()) == 1
    assert len(approvals.json()) == 1
