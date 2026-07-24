import json
import os
import sqlite3
from collections.abc import Mapping
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import UUID, uuid4

from app.config import get_settings
from app.repositories.demo import feed_plans as seed_feed_plans
from app.schemas.operations import FeedPlanCreate, FeedPlanSummary, FeedPlanUpdate


class _PostgresConnection:
    """Keeps the repository SQL portable while Cloud Run uses PostgreSQL."""
    def __init__(self, raw: Any) -> None:
        self.raw = raw

    def execute(self, statement: str, params: tuple[object, ...] | None = None) -> Any:
        return self.raw.execute(statement.replace("?", "%s"), params)

    def commit(self) -> None:
        self.raw.commit()

    def close(self) -> None:
        self.raw.close()


def _connection() -> sqlite3.Connection | _PostgresConnection:
    # Tests use an isolated database so a developer's local plan history cannot affect fixtures.
    settings = get_settings()
    if settings.database_url and not os.getenv("PYTEST_CURRENT_TEST"):
        from psycopg import connect
        from psycopg.rows import dict_row

        connection = _PostgresConnection(connect(settings.database_url, row_factory=dict_row))
        connection.execute("""CREATE TABLE IF NOT EXISTS feed_plans (
            id TEXT PRIMARY KEY, culture_unit_id TEXT NOT NULL, culture_unit_name TEXT NOT NULL,
            scheduled_for TEXT NOT NULL, amount_kg DOUBLE PRECISION NOT NULL,
            feed_name TEXT NOT NULL,
            owner_name TEXT NOT NULL, status TEXT NOT NULL, rationale TEXT NOT NULL,
            actual_amount_kg DOUBLE PRECISION, recorded_at TEXT
        )""")
        if connection.execute("SELECT COUNT(*) AS count FROM feed_plans").fetchone()["count"] == 0:
            for item in seed_feed_plans():
                connection.execute(
                    "INSERT INTO feed_plans VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
                    (str(item.id), str(item.culture_unit_id), item.culture_unit_name,
                     item.scheduled_for.isoformat(), item.amount_kg, item.feed_name,
                     item.owner_name, item.status, json.dumps(item.rationale)),
                )
            connection.commit()
        return connection
    configured_path = (
        "/tmp/feed-sync-test.db"
        if os.getenv("PYTEST_CURRENT_TEST")
        else get_settings().feed_sync_db_path
    )
    path = Path(configured_path)
    if not path.is_absolute():
        path = Path(__file__).resolve().parents[2] / path
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("""CREATE TABLE IF NOT EXISTS feed_plans (
        id TEXT PRIMARY KEY, culture_unit_id TEXT NOT NULL, culture_unit_name TEXT NOT NULL,
        scheduled_for TEXT NOT NULL, amount_kg REAL NOT NULL, feed_name TEXT NOT NULL,
        owner_name TEXT NOT NULL, status TEXT NOT NULL, rationale TEXT NOT NULL,
        actual_amount_kg REAL, recorded_at TEXT
    )""")
    if connection.execute("SELECT COUNT(*) FROM feed_plans").fetchone()[0] == 0:
        for item in seed_feed_plans():
            connection.execute(
                "INSERT INTO feed_plans VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
                (str(item.id), str(item.culture_unit_id), item.culture_unit_name,
                 item.scheduled_for.isoformat(), item.amount_kg, item.feed_name,
                 item.owner_name, item.status, json.dumps(item.rationale)),
            )
        connection.commit()
    return connection


def _to_model(row: sqlite3.Row | Mapping[str, object]) -> FeedPlanSummary:
    return FeedPlanSummary(
        id=UUID(row["id"]), culture_unit_id=UUID(row["culture_unit_id"]),
        culture_unit_name=row["culture_unit_name"],
        scheduled_for=datetime.fromisoformat(row["scheduled_for"]), amount_kg=row["amount_kg"],
        feed_name=row["feed_name"], owner_name=row["owner_name"], status=row["status"],
        rationale=json.loads(row["rationale"]),
    )


def list_feed_plans() -> list[FeedPlanSummary]:
    connection = _connection()
    rows = connection.execute("SELECT * FROM feed_plans ORDER BY scheduled_for").fetchall()
    connection.close()
    return [_to_model(row) for row in rows]


def create_feed_plan(payload: FeedPlanCreate, culture_unit_name: str) -> FeedPlanSummary:
    item = FeedPlanSummary(
        id=uuid4(), culture_unit_id=payload.culture_unit_id, culture_unit_name=culture_unit_name,
        scheduled_for=payload.scheduled_for, amount_kg=payload.amount_kg,
        feed_name=payload.feed_name, owner_name=payload.owner_name,
        status="awaiting_approval", rationale=payload.rationale,
    )
    connection = _connection()
    connection.execute(
        "INSERT INTO feed_plans VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
        (str(item.id), str(item.culture_unit_id), item.culture_unit_name,
         item.scheduled_for.isoformat(), item.amount_kg, item.feed_name,
         item.owner_name, item.status, json.dumps(item.rationale)),
    )
    connection.commit()
    connection.close()
    return item


def update_feed_plan(plan_id: UUID, payload: FeedPlanUpdate) -> FeedPlanSummary | None:
    connection = _connection()
    row = connection.execute("SELECT * FROM feed_plans WHERE id = ?", (str(plan_id),)).fetchone()
    if row is None:
        connection.close()
        return None
    status = payload.status or row["status"]
    recorded = (
        datetime.now(UTC).isoformat()
        if payload.actual_amount_kg is not None
        else row["recorded_at"]
    )
    connection.execute(
        "UPDATE feed_plans SET status = ?, actual_amount_kg = COALESCE(?, actual_amount_kg), "
        "recorded_at = ? WHERE id = ?",
                       (status, payload.actual_amount_kg, recorded, str(plan_id)))
    connection.commit()
    result = connection.execute("SELECT * FROM feed_plans WHERE id = ?", (str(plan_id),)).fetchone()
    connection.close()
    return _to_model(result)
