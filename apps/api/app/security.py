from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from pydantic import ValidationError

from app.config import get_settings
from app.schemas.token import TokenData

settings = get_settings()


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.auth_access_token_expire_minutes
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.auth_secret_key.get_secret_value(),
        algorithm=settings.auth_algorithm,
    )
    return encoded_jwt


def decode_access_token(token: str) -> TokenData | None:
    try:
        payload = jwt.decode(
            token,
            settings.auth_secret_key.get_secret_value(),
            algorithms=[settings.auth_algorithm],
        )
        token_data = TokenData(**payload)
        return token_data
    except (JWTError, ValidationError):
        return None
