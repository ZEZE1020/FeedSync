import httpx
import pytest

from app.integrations import Coordinates, KijaniSpaceClient, KijaniSpaceError


@pytest.mark.asyncio
async def test_water_context_uses_documented_endpoint_and_basic_auth() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/v1/agro_climate/water"
        assert dict(request.url.params) == {"lat": "-0.1", "lon": "34.75"}
        assert request.headers["Authorization"] == "Basic dXNlcjpwYXNzd29yZA=="
        return httpx.Response(200, json={"temperature": 24})

    async with KijaniSpaceClient(
        username="user",
        password="password",
        transport=httpx.MockTransport(handler),
    ) as client:
        response = await client.get_water_context(Coordinates(latitude=-0.1, longitude=34.75))

    assert response == {"temperature": 24}


def test_basic_auth_credentials_must_be_configured_together() -> None:
    with pytest.raises(ValueError, match="configured together"):
        KijaniSpaceClient(username="user")


@pytest.mark.asyncio
async def test_upstream_status_is_preserved() -> None:
    transport = httpx.MockTransport(lambda request: httpx.Response(401, request=request))
    async with KijaniSpaceClient(transport=transport) as client:
        with pytest.raises(KijaniSpaceError, match="KijaniSpace request failed") as error:
            await client.get_locations()

    assert error.value.status_code == 401
