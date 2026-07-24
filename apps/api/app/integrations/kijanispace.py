from typing import Any

import httpx
from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    latitude: float = Field(ge=-5.1, le=2.5)
    longitude: float = Field(ge=28.95, le=36.7)


class KijaniSpaceError(Exception):
    def __init__(self, status_code: int, message: str = "KijaniSpace request failed") -> None:
        super().__init__(message)
        self.status_code = status_code


class KijaniSpaceClient:
    def __init__(
        self,
        *,
        base_url: str = "https://api.kijanispace.eu",
        username: str | None = None,
        password: str | None = None,
        timeout_seconds: float = 10.0,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        if bool(username) != bool(password):
            raise ValueError("KijaniSpace username and password must be configured together")
        auth = httpx.BasicAuth(username, password) if username and password else None
        self._client = httpx.AsyncClient(
            auth=auth,
            base_url=base_url.rstrip("/"),
            headers={"Accept": "application/json"},
            timeout=timeout_seconds,
            transport=transport,
        )

    async def __aenter__(self) -> "KijaniSpaceClient":
        return self

    async def __aexit__(self, *args: object) -> None:
        await self.close()

    async def close(self) -> None:
        await self._client.aclose()

    async def get_water_context(self, coordinates: Coordinates) -> Any:
        return await self._get("/v1/agro_climate/water", coordinates)

    async def get_land_context(self, coordinates: Coordinates) -> Any:
        return await self._get("/v1/agro_climate/land", coordinates)

    async def get_locations(self) -> Any:
        return await self._get("/v1/eo/locations")

    async def list_datasources(self) -> Any:
        return await self._get("/v1/datasources")

    async def get_datasource(self, identifier: int) -> Any:
        return await self._get(f"/v1/datasources/{identifier}")

    async def _get(self, path: str, coordinates: Coordinates | None = None) -> Any:
        params = None
        if coordinates:
            params = {
                "lat": coordinates.latitude,
                "lon": coordinates.longitude,
            }
        try:
            response = await self._client.get(path, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as error:
            raise KijaniSpaceError(error.response.status_code) from error
        except (httpx.RequestError, ValueError) as error:
            raise KijaniSpaceError(503, "KijaniSpace is unavailable") from error
