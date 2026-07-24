# KijaniSpace API integration

Source documentation: [SpaceIoTBox API Swagger UI](https://api.kijanispace.eu/docs#/). This note is
based on OpenAPI version `0.1.0`, inspected on 24 July 2026.

## Relevant endpoints

| Endpoint                                         | Use in Feed Sync                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `GET /v1/agro_climate/water?lat={lat}&lon={lon}` | Water-location forecast and static lake context                         |
| `GET /v1/agro_climate/land?lat={lat}&lon={lon}`  | Combined weather, agricultural, and static context                      |
| `GET /v1/eo/locations`                           | Discover available Earth-observation locations                          |
| `GET /v1/eo/stac{full_path}`                     | Access the proxied STAC catalog when imagery becomes an MVP requirement |

The API limits coordinates to latitude `-5.1..2.5` and longitude `28.95..36.7` (WGS84), around the
Lake Victoria region. The FastAPI query model and HTTPX client validate these bounds before making a
request. The upstream service additionally verifies that the point represents water; a point inside
the numeric bounds can still return HTTP 400 with `not water`.

## Authentication

Protected endpoints advertise four alternatives: bearer token, `X-API-Key`, `api_key` query
parameter, and HTTP Basic. Feed Sync uses HTTP Basic with the server-only
`KIJANISPACE_USERNAME` and `KIJANISPACE_PASSWORD` environment variables. The HTTPX client constructs
the `Authorization` header; credentials never pass through the browser. Partial credential
configuration is rejected rather than sending an ambiguous request.

## Current implementation

The API exposes a narrow server-side proxy:

```text
GET /v1/context/water?lat=-1.0&lon=33.0
```

10-second timeout and converts non-success responses into a typed error. It never logs credentials.
It validates input, calls KijaniSpace through an asynchronous HTTPX client, validates the observed
provider shape and returns a normalized `WaterContextResponse`. Forecast arrays become dated objects
with explicit units in field names. The client includes a 10-second timeout and converts non-success
responses into a typed error. It never logs credentials.

This endpoint is useful for both ponds and cages as **regional weather context**. It is not treated
as a substitute for local water measurements. See [Pond and cage alignment](culture-systems.md).

## Observed live response

An authenticated smoke test on 24 July 2026 at the open-water coordinate `-1.0, 33.0` returned:

- location and `EAT` timezone;
- explicit units for every measurement;
- water-body percentage;
- monthly climatological lake-water temperature;
- bathymetry and diffuse attenuation coefficient;
- five daily values for mean/minimum/maximum temperature and wind speed;
- daily precipitation;
- `meteoblue` as the source.

The published endpoint description currently says one forecast day, while the observed response
contained five. Successful OpenAPI responses still have no schema, so consumers must tolerate the
provider changing the horizon or omitting nullable fields.
10-second timeout and converts non-success responses into a typed error. It never logs credentials.

## Before recommendation logic

The climate endpoints' successful OpenAPI responses currently have empty schemas. Capture several
authorized responses, add fixtures with sensitive fields removed, then create an explicit normalizer
that maps known values to `WaterObservation`. Validate payloads at runtime and treat missing or stale
fields as unavailable—not as zero.

Recommended resilience for the next iteration:

- cache the last successful forecast by rounded location and expiration time;
- retry only transient failures with exponential backoff and jitter;
- surface the source timestamp and freshness in the dashboard;
- retain the previous valid context when the provider is unavailable;
- add contract checks against the published `/openapi.json` in CI.

See [Feed Sync API contract](api-contract.md) for UI endpoint mappings and failure behavior.
