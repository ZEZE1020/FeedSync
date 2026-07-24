from typing import Annotated, Any, cast

from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies import get_kijanispace_client
from app.integrations import Coordinates, KijaniSpaceClient, KijaniSpaceError
from app.schemas.context import (
    DataSource,
    DataSourceListResponse,
    LandContextResponse,
    LocationCatalogResponse,
    WaterContextResponse,
)
from app.services import normalize_datasources, normalize_locations, normalize_water_context
from app.services.kijanispace_normalizer import KijaniPayloadError

router = APIRouter(prefix="/v1/context", tags=["context"])
Client = Annotated[KijaniSpaceClient, Depends(get_kijanispace_client)]


def _provider_error(error: KijaniSpaceError) -> HTTPException:
    if error.status_code in {401, 403}:
        status_code = 502
        detail = "KijaniSpace authentication failed"
    elif error.status_code == 400:
        status_code = 422
        detail = "KijaniSpace rejected the requested location or parameters"
    else:
        status_code = 503
        detail = "KijaniSpace is temporarily unavailable"
    return HTTPException(
        status_code=status_code,
        detail={"error": detail, "upstream_status": error.status_code},
    )


@router.get("/water", response_model=WaterContextResponse)
async def water_context(
    client: Client,
    lat: Annotated[float, Query(ge=-5.1, le=2.5)],
    lon: Annotated[float, Query(ge=28.95, le=36.7)],
) -> WaterContextResponse:
    try:
        payload = await client.get_water_context(Coordinates(latitude=lat, longitude=lon))
        return normalize_water_context(payload)
    except KijaniSpaceError as error:
        raise _provider_error(error) from error
    except KijaniPayloadError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


@router.get("/land", response_model=LandContextResponse)
async def land_context(
    client: Client,
    lat: Annotated[float, Query(ge=-5.1, le=2.5)],
    lon: Annotated[float, Query(ge=28.95, le=36.7)],
) -> LandContextResponse:
    try:
        payload: Any = await client.get_land_context(Coordinates(latitude=lat, longitude=lon))
    except KijaniSpaceError as error:
        raise _provider_error(error) from error
    if not isinstance(payload, dict):
        raise HTTPException(status_code=502, detail="KijaniSpace land response was not an object")
    return LandContextResponse(data=cast(dict[str, Any], payload))


@router.get("/locations", response_model=LocationCatalogResponse)
async def locations(client: Client) -> LocationCatalogResponse:
    try:
        return LocationCatalogResponse(locations=normalize_locations(await client.get_locations()))
    except KijaniSpaceError as error:
        raise _provider_error(error) from error
    except KijaniPayloadError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


@router.get("/datasources", response_model=DataSourceListResponse)
async def datasources(
    client: Client,
    domains: Annotated[list[str] | None, Query(alias="domain")] = None,
) -> DataSourceListResponse:
    try:
        items = normalize_datasources(await client.list_datasources())
    except KijaniSpaceError as error:
        raise _provider_error(error) from error
    except KijaniPayloadError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    applied_domains = sorted(set(domains or []))
    if applied_domains:
        items = [item for item in items if set(item.domain).intersection(applied_domains)]
    return DataSourceListResponse(
        items=items,
        total=len(items),
        applied_domains=applied_domains,
    )


@router.get("/datasources/{identifier}", response_model=DataSource)
async def datasource(identifier: int, client: Client) -> DataSource:
    try:
        return DataSource.model_validate(await client.get_datasource(identifier))
    except KijaniSpaceError as error:
        if error.status_code == 404:
            raise HTTPException(status_code=404, detail="Datasource not found") from error
        raise _provider_error(error) from error
