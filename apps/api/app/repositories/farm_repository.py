from typing import Any
from uuid import UUID, uuid4

from psycopg import AsyncConnection
from psycopg.rows import dict_row

from app.schemas.farm import Farm, FarmCreate


async def ensure_schema(connection: AsyncConnection[Any]) -> None:
    """Ensures the required database schema exists."""
    async with connection.cursor() as cursor:
        await cursor.execute("""CREATE TABLE IF NOT EXISTS farms (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
        )""")


async def create_farm(connection: AsyncConnection[Any], farm: FarmCreate, owner_id: UUID) -> Farm:
    """Creates a new farm for a given owner."""
    await ensure_schema(connection)
    farm_id = uuid4()
    async with connection.cursor(row_factory=dict_row) as cursor:
        await cursor.execute(
            """INSERT INTO farms (id, name, owner_id)
               VALUES (%s, %s, %s)""",
            (farm_id, farm.name, owner_id),
        )
    return Farm(id=farm_id, name=farm.name, owner_id=owner_id)
