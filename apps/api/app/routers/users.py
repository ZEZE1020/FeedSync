from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from psycopg import AsyncConnection

from app.dependencies import get_db_connection
from app.repositories.user_repository import (
    create_user,
    get_user_by_email,
    verify_password,
)
from app.schemas.token import Token
from app.schemas.user import User, UserCreate
from app.security import create_access_token, decode_access_token

router = APIRouter(prefix="/v1/users", tags=["users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/users/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    connection: AsyncConnection[Any] = Depends(get_db_connection),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = decode_access_token(token)
    if token_data is None or token_data.sub is None:
        raise credentials_exception
    user = await get_user_by_email(connection, email=token_data.sub)
    if user is None:
        raise credentials_exception
    return user


@router.post("/signup", response_model=User, status_code=201)
async def signup(
    user: UserCreate,
    connection: AsyncConnection[Any] = Depends(get_db_connection),
) -> User:
    """Creates a new user."""
    db_user = await get_user_by_email(connection, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return await create_user(connection=connection, user=user)


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    connection: AsyncConnection[Any] = Depends(get_db_connection),
) -> Token:
    """Logs a user in and returns a JWT token."""
    user = await get_user_by_email(connection, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token, token_type="bearer")
