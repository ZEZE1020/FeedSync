from typing import Any

from fastapi import APIRouter, Depends
from psycopg import AsyncConnection

from app.dependencies import get_db_connection
from app.repositories.farm_repository import create_farm
from app.routers.users import get_current_user
from app.schemas.farm import Farm, FarmCreate
from app.schemas.user import User

router = APIRouter(prefix="/v1/farms", tags=["farms"])


@router.post("", response_model=Farm, status_code=201)
async def register_farm(
    farm: FarmCreate,
    current_user: User = Depends(get_current_user),
    connection: AsyncConnection[Any] = Depends(get_db_connection),
) -> Farm:
    """Creates a new farm for the current user."""
    return await create_farm(connection=connection, farm=farm, owner_id=current_user.id)
