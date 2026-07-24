from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends

from app.config import Settings, get_settings
from app.integrations import KijaniSpaceClient


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
