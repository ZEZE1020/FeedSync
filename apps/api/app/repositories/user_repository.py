from typing import Any
from uuid import UUID, uuid4

from passlib.context import CryptContext
from psycopg import AsyncConnection
from psycopg.rows import dict_row

from app.schemas.user import User, UserCreate, UserInDB

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


async def ensure_schema(connection: AsyncConnection[Any]) -> None:
    """Ensures the required database schema exists."""
    async with connection.cursor() as cursor:
        await cursor.execute("""CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT,
            hashed_password TEXT NOT NULL
        )""")


async def get_user_by_email(connection: AsyncConnection[Any], email: str) -> UserInDB | None:
    """Retrieves a user by their email address."""
    await ensure_schema(connection)
    async with connection.cursor(row_factory=dict_row) as cursor:
        await cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        row = await cursor.fetchone()
        if not row:
            return None
        return UserInDB(**row)


async def create_user(connection: AsyncConnection[Any], user: UserCreate) -> User:
    """Creates a new user."""
    await ensure_schema(connection)
    hashed_password = get_password_hash(user.password)
    user_id = uuid4()
    async with connection.cursor(row_factory=dict_row) as cursor:
        await cursor.execute(
            """INSERT INTO users (id, email, full_name, hashed_password)
               VALUES (%s, %s, %s, %s)""",
            (user_id, user.email, user.full_name, hashed_password),
        )
    return User(id=user_id, email=user.email, full_name=user.full_name)
