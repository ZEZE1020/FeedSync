from datetime import UTC, datetime, timedelta
from typing import Literal
from uuid import UUID, uuid4

from app.schemas.operations import (
    AlertSummary,
    CultureUnitCreate,
    CultureUnitSummary,
    DeviceSummary,
    FeedPlanSummary,
)

FARM_ID = UUID("00000000-0000-4000-8000-000000000001")
UNIT_IDS = [UUID(f"00000000-0000-4000-8000-{index:012d}") for index in range(101, 109)]
FeedPlanStatus = Literal["approved", "awaiting_approval", "draft", "executed", "scheduled"]
DeviceKind = Literal["dissolved_oxygen", "feeder_controller", "water_monitor"]
DeviceStatus = Literal["offline", "online"]
_created_units: list[CultureUnitSummary] = []


def _now() -> datetime:
    return datetime.now(UTC)


def culture_units() -> list[CultureUnitSummary]:
    now = _now()
    return [
        CultureUnitSummary(
            id=UNIT_IDS[0],
            farm_id=FARM_ID,
            name="North pond",
            kind="pond",
            species="Nile tilapia",
            stocked_fish_count=2_000,
            estimated_biomass_kg=1_240,
            geometry_label="600 m² · 1.2 m avg depth",
            latest_temperature_c=25.1,
            health_status="review",
            sample_due_at=now,
        ),
        CultureUnitSummary(
            id=UNIT_IDS[1],
            farm_id=FARM_ID,
            name="Nursery pond",
            kind="pond",
            species="Nile tilapia",
            stocked_fish_count=4_500,
            estimated_biomass_kg=420,
            geometry_label="280 m² · 0.9 m avg depth",
            latest_temperature_c=25.8,
            health_status="healthy",
        ),
        CultureUnitSummary(
            id=UNIT_IDS[2],
            farm_id=FARM_ID,
            name="South pond",
            kind="pond",
            species="African catfish",
            stocked_fish_count=1_400,
            estimated_biomass_kg=980,
            geometry_label="520 m² · 1.4 m avg depth",
            latest_temperature_c=25.4,
            health_status="healthy",
        ),
        CultureUnitSummary(
            id=UNIT_IDS[3],
            farm_id=FARM_ID,
            name="Lake cage A",
            kind="cage",
            species="Nile tilapia",
            stocked_fish_count=5_000,
            estimated_biomass_kg=2_850,
            geometry_label="125 m³ · 12 m site depth",
            latest_temperature_c=24.7,
            health_status="healthy",
        ),
        CultureUnitSummary(
            id=UNIT_IDS[4],
            farm_id=FARM_ID,
            name="Lake cage B",
            kind="cage",
            species="Nile tilapia",
            stocked_fish_count=4_800,
            estimated_biomass_kg=2_610,
            geometry_label="125 m³ · 14 m site depth",
            latest_temperature_c=24.6,
            health_status="healthy",
        ),
        CultureUnitSummary(
            id=UNIT_IDS[5],
            farm_id=FARM_ID,
            name="Lake cage C",
            kind="cage",
            species="Nile tilapia",
            stocked_fish_count=4_600,
            estimated_biomass_kg=2_420,
            geometry_label="125 m³ · 13 m site depth",
            latest_temperature_c=None,
            health_status="attention",
        ),
        CultureUnitSummary(
            id=UNIT_IDS[6],
            farm_id=FARM_ID,
            name="Lake cage D",
            kind="cage",
            species="Nile tilapia",
            stocked_fish_count=3_600,
            estimated_biomass_kg=1_720,
            geometry_label="100 m³ · 11 m site depth",
            latest_temperature_c=24.8,
            health_status="healthy",
        ),
        CultureUnitSummary(
            id=UNIT_IDS[7],
            farm_id=FARM_ID,
            name="Lake cage E",
            kind="cage",
            species="Nile tilapia",
            stocked_fish_count=3_200,
            estimated_biomass_kg=1_490,
            geometry_label="100 m³ · 12 m site depth",
            latest_temperature_c=24.8,
            health_status="healthy",
        ),
    ] + _created_units


def create_culture_unit(payload: CultureUnitCreate) -> CultureUnitSummary:
    item = CultureUnitSummary(
        id=uuid4(), farm_id=FARM_ID, name=payload.name, kind=payload.kind,
        species=payload.species, stocked_fish_count=payload.stocked_fish_count,
        estimated_biomass_kg=payload.estimated_biomass_kg, geometry_label=payload.geometry_label,
        health_status="review",
    )
    _created_units.append(item)
    return item


def feed_plans() -> list[FeedPlanSummary]:
    now = _now()
    rows: list[tuple[int, int, str, int, float, str, FeedPlanStatus]] = [
        (201, 3, "Lake cage A", 1, 12.5, "Amina Otieno", "awaiting_approval"),
        (202, 0, "North pond", 3, 8.2, "David Kamau", "approved"),
        (203, 1, "Nursery pond", 6, 4.8, "David Kamau", "draft"),
        (204, 4, "Lake cage B", 24, 11.8, "Amina Otieno", "scheduled"),
        (205, 2, "South pond", 27, 6.1, "David Kamau", "scheduled"),
        (206, 6, "Lake cage D", 30, 4.8, "Amina Otieno", "scheduled"),
    ]
    return [
        FeedPlanSummary(
            id=UUID(f"00000000-0000-4000-8000-{identifier:012d}"),
            culture_unit_id=UNIT_IDS[unit_index],
            culture_unit_name=name,
            scheduled_for=now + timedelta(hours=hours),
            amount_kg=amount,
            feed_name="Tilapia grower pellets",
            owner_name=owner,
            status=status,
            rationale=["Biomass sample is current", "Forecast conditions checked"],
        )
        for identifier, unit_index, name, hours, amount, owner, status in rows
    ]


def devices() -> list[DeviceSummary]:
    now = _now()
    rows: list[tuple[int, int, str, str, DeviceKind, DeviceStatus, str, str, int]] = [
        (301, 0, "North pond", "WM-POND-01", "water_monitor", "online", "25.1°C", "86%", 4),
        (302, 3, "Lake cage A", "WM-CAGE-01", "water_monitor", "online", "24.7°C", "72%", 4),
        (303, 5, "Lake cage C", "DO-CAGE-03", "dissolved_oxygen", "offline", "No data", "—", 120),
        (
            304,
            3,
            "Lake cage A",
            "FC-CAGE-01",
            "feeder_controller",
            "online",
            "Ready",
            "External",
            2,
        ),
        (305, 4, "Lake cage B", "WM-CAGE-02", "water_monitor", "online", "24.6°C", "81%", 5),
        (306, 1, "Nursery pond", "WM-POND-02", "water_monitor", "online", "25.8°C", "90%", 6),
        (
            307,
            6,
            "Lake cage D",
            "FC-CAGE-04",
            "feeder_controller",
            "online",
            "Ready",
            "External",
            3,
        ),
    ]
    return [
        DeviceSummary(
            id=UUID(f"00000000-0000-4000-8000-{identifier:012d}"),
            culture_unit_id=UNIT_IDS[unit_index],
            culture_unit_name=unit_name,
            name=name,
            kind=kind,
            status=status,
            latest_state=latest_state,
            battery_label=battery,
            last_seen_at=now - timedelta(minutes=minutes_ago),
        )
        for (
            identifier,
            unit_index,
            unit_name,
            name,
            kind,
            status,
            latest_state,
            battery,
            minutes_ago,
        ) in rows
    ]


def alerts() -> list[AlertSummary]:
    now = _now()
    return [
        AlertSummary(
            id=UUID("00000000-0000-4000-8000-000000000401"),
            culture_unit_id=UNIT_IDS[5],
            culture_unit_name="Lake cage C",
            title="DO sensor offline",
            detail="Last observation was 2 hours ago",
            severity="attention",
            created_at=now - timedelta(hours=2),
        ),
        AlertSummary(
            id=UUID("00000000-0000-4000-8000-000000000402"),
            culture_unit_id=UNIT_IDS[0],
            culture_unit_name="North pond",
            title="Biomass sample due",
            detail="Sampling is due today",
            severity="info",
            created_at=now - timedelta(hours=5),
        ),
    ]
