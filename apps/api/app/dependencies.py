from collections.abc import AsyncIterator
from typing import Annotated, Any

from fastapi import Depends
from psycopg import AsyncConnection

from app.config import Settings, get_settings
from app.db import get_pool
from app.integrations import KijaniSpaceClient


async def get_db_connection() -> AsyncIterator[AsyncConnection[Any]]:
    """Yields a database connection from the active pool."""
    pool = get_pool()
    async with pool.connection() as connection:
        yield connection


async def get_kijanispace_client(
    settings: Annotated[Settings, Depends(get_settings)],
) -> AsyncIterator[KijaniSpaceClient]:
    password = (
        settings.kijanispace_password.get_secret_value() if settings.kijanispace_password else None
    )
    async with KijaniSpaceClient(
        base_url=settings.kijanispace_api_base_url,
        username=settings.kijanispace_username,
        password=password,
    ) as client:
        yield client