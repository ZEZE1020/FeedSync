from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.domain import CageProfile, CultureUnit, PondProfile


def test_culture_unit_supports_a_pond_profile() -> None:
    unit = CultureUnit(
        id=uuid4(),
        farm_id=uuid4(),
        name="North pond",
        species="Nile tilapia",
        stocked_fish_count=2_000,
        profile=PondProfile(surface_area_m2=600, average_depth_m=1.2),
    )

    assert unit.profile.kind == "pond"


def test_culture_unit_supports_a_cage_profile() -> None:
    unit = CultureUnit(
        id=uuid4(),
        farm_id=uuid4(),
        name="Cage A",
        species="Nile tilapia",
        stocked_fish_count=5_000,
        profile=CageProfile(volume_m3=125, site_depth_m=12),
    )

    assert unit.profile.kind == "cage"


def test_cage_requires_site_depth() -> None:
    with pytest.raises(ValidationError):
        CageProfile.model_validate({"kind": "cage", "volume_m3": 125})
