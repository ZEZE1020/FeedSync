import json
from collections.abc import Mapping
from datetime import UTC, datetime
from typing import Any
from uuid import UUID, uuid4

from psycopg import AsyncConnection
from psycopg.rows import dict_row

from app.schemas.operations import FeedPlanCreate, FeedPlanSummary, FeedPlanUpdate


def _to_model(row: Mapping[str, object]) -> FeedPlanSummary:
    """Converts a database row to a FeedPlanSummary model."""
    return FeedPlanSummary(
        id=row["id"],
        culture_unit_id=row["culture_unit_id"],
        culture_unit_name=row["culture_unit_name"],
        scheduled_for=row["scheduled_for"],
        amount_kg=row["amount_kg"],
        feed_name=row["feed_name"],
        owner_name=row["owner_name"],
        status=row["status"],
        rationale=json.loads(row["rationale"]),
    )


async def ensure_schema(connection: AsyncConnection[Any]) -> None:
    """Ensures the required database schema exists."""
    async with connection.cursor() as cursor:
        await cursor.execute("""CREATE TABLE IF NOT EXISTS feed_plans (
            id UUID PRIMARY KEY,
            culture_unit_id UUID NOT NULL,
            culture_unit_name TEXT NOT NULL,
            scheduled_for TIMESTAMPTZ NOT NULL,
            amount_kg DOUBLE PRECISION NOT NULL,
            feed_name TEXT NOT NULL,
            owner_name TEXT NOT NULL,
            status TEXT NOT NULL,
            rationale JSONB NOT NULL,
            actual_amount_kg DOUBLE PRECISION,
            recorded_at TIMESTAMPTZ
        )""")


async def list_feed_plans(connection: AsyncConnection[Any]) -> list[FeedPlanSummary]:
    """Lists all feed plans in chronological order."""
    await ensure_schema(connection)
    async with connection.cursor(row_factory=dict_row) as cursor:
        await cursor.execute("SELECT * FROM feed_plans ORDER BY scheduled_for")
        rows = await cursor.fetchall()
        return [_to_model(row) for row in rows]


async def create_feed_plan(
    connection: AsyncConnection[Any], payload: FeedPlanCreate, culture_unit_name: str
) -> FeedPlanSummary:
    """Creates a new feed plan."""
    await ensure_schema(connection)
    item = FeedPlanSummary(
        id=uuid4(),
        culture_unit_id=payload.culture_unit_id,
        culture_unit_name=culture_unit_name,
        scheduled_for=payload.scheduled_for,
        amount_kg=payload.amount_kg,
        feed_name=payload.feed_name,
        owner_name=payload.owner_name,
        status="awaiting_approval",
        rationale=payload.rationale,
    )
    async with connection.cursor() as cursor:
        await cursor.execute(
            """INSERT INTO feed_plans (
                id, culture_unit_id, culture_unit_name, scheduled_for, amount_kg,
                feed_name, owner_name, status, rationale
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                item.id,
                item.culture_unit_id,
                item.culture_unit_name,
                item.scheduled_for,
                item.amount_kg,
                item.feed_name,
                item.owner_name,
                item.status,
                json.dumps(item.rationale),
            ),
        )
    return item


async def update_feed_plan(
    connection: AsyncConnection[Any], plan_id: UUID, payload: FeedPlanUpdate
) -> FeedPlanSummary | None:
    """Updates the status or recorded consumption of a feed plan."""
    await ensure_schema(connection)
    async with connection.cursor(row_factory=dict_row) as cursor:
        await cursor.execute("SELECT * FROM feed_plans WHERE id = %s", (plan_id,))
        row = await cursor.fetchone()
        if row is None:
            return None

        status = payload.status or row["status"]
        recorded = (
            datetime.now(UTC)
            if payload.actual_amount_kg is not None
            else row["recorded_at"]
        )
        await cursor.execute(
            """UPDATE feed_plans
               SET status = %s,
                   actual_amount_kg = COALESCE(%s, actual_amount_kg),
                   recorded_at = %s
               WHERE id = %s""",
            (status, payload.actual_amount_kg, recorded, plan_id),
        )

        await cursor.execute("SELECT * FROM feed_plans WHERE id = %s", (plan_id,))
        result = await cursor.fetchone()
        return _to_model(result) if result else None
