from typing import Any

import pytest

from app.services.kijanispace_normalizer import KijaniPayloadError, normalize_water_context


def test_water_normalizer_rejects_mismatched_forecast_series() -> None:
    payload: dict[str, Any] = {
        "location": {"latitude": -1, "longitude": 33, "timezone": "EAT"},
        "static_data": {"water_body_percentage": 100},
        "forecast_data": {
            "time": ["2026-07-24"],
            "temperature_mean": [],
            "temperature_max": [25],
            "temperature_min": [24],
            "windspeed_mean": [2],
            "windspeed_max": [3],
            "windspeed_min": [1],
            "precipitation": [0],
        },
        "source": "meteoblue",
    }

    with pytest.raises(KijaniPayloadError, match="length mismatch"):
        normalize_water_context(payload)
