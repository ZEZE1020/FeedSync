from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from psycopg_pool import AsyncConnectionPool

from app.config import get_settings

pool: AsyncConnectionPool | None = None


def create_pool() -> AsyncConnectionPool:
    """Creates a new async connection pool."""
    settings = get_settings()
    if not settings.database_url:
        raise RuntimeError("Database connection has not been configured")
    return AsyncConnectionPool(conninfo=settings.database_url)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manages the connection pool lifespan."""
    global pool
    pool = create_pool()
    yield
    if pool:
        await pool.close()
        pool = None


def get_pool() -> AsyncConnectionPool:
    """Returns the active connection pool."""
    if pool is None:
        raise RuntimeError("Connection pool is not available")
    return pool
