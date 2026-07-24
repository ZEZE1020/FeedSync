# Feed Sync API contract

The Feed Sync API exposes UI-oriented resources and keeps the KijaniSpace provider contract behind a
normalization layer. Interactive documentation is available at `http://localhost:3001/docs` while
the development stack is running.

## UI endpoints

| Endpoint                          | UI consumer                                               | Data source                                      |
| --------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `GET /v1/dashboard/summary`       | Dashboard metrics, lake outlook, alerts and next feedings | Live KijaniSpace water context + operational store |
| `GET /v1/culture-units`           | Farms & units cards                                       | Demo repository                                  |
| `GET /v1/culture-units/{unit_id}` | Future culture-unit detail                                | Demo repository                                  |
| `GET /v1/feed-plans`              | Feed plan table and filters                               | SQLite operational store (seeded on first run)   |
| `POST /v1/feed-plans`             | Create schedule                                           | SQLite operational store                         |
| `PATCH /v1/feed-plans/{plan_id}`  | Approve or record actual feed                            | SQLite operational store                         |
| `GET /v1/devices`                 | Device status cards                                       | Demo repository                                  |
| `GET /v1/alerts`                  | Dashboard/device attention states                         | Demo repository                                  |

Supported query filters:

- culture units: `kind=cage|pond`, `health=attention|healthy|review`;
- feed plans: `status`, `culture_unit_id`;
- devices: `status=offline|online`, `culture_unit_id`;
- alerts: `severity=attention|critical|info`, `resolved=true|false`.

Culture units, devices and alerts currently use stable seeded fixtures. Feed plans are persisted
locally for the MVP. Before production multi-farm use, add tenant ownership, authenticated user IDs,
idempotency and an audit trail.

## Context endpoints

| Endpoint                                   | Provider endpoint              | Behavior                                                                |
| ------------------------------------------ | ------------------------------ | ----------------------------------------------------------------------- |
| `GET /v1/context/water?lat=&lon=`          | `/v1/agro_climate/water`       | Validates and normalizes static lake context plus daily forecast arrays |
| `GET /v1/context/land?lat=&lon=`           | `/v1/agro_climate/land`        | Preserves the provider shape while UI requirements are evaluated        |
| `GET /v1/context/locations`                | `/v1/eo/locations`             | Returns EO products and available dates by named location               |
| `GET /v1/context/datasources`              | `/v1/datasources`              | Returns typed catalog records and accepts repeatable `domain` filters   |
| `GET /v1/context/datasources/{identifier}` | `/v1/datasources/{identifier}` | Returns one catalog record                                              |

Examples:

```bash
curl "http://localhost:3001/v1/dashboard/summary?lat=-1.0&lon=33.0"
curl "http://localhost:3001/v1/culture-units?kind=cage"
curl "http://localhost:3001/v1/devices?status=offline"
curl "http://localhost:3001/v1/context/datasources?domain=fish_farming&domain=water"
```

## KijaniSpace datasource findings

The authenticated catalog contained 18 records on 24 July 2026. Twelve matched at least one of
`fish_farming`, `water` or `weather`:

- NASA Ocean Color APIs: chlorophyll, surface temperature, algae and oxygen;
- ESA CCI Lakes: lake extent, surface water and algae;
- meteoblue Ocean/Water: waves, salinity, water temperature and currents;
- meteoblue Weather: temperature, precipitation, wind, humidity and solar radiation;
- Hydromet Uganda: weather, soil moisture and water quality;
- Biovariables: fish yield and algae bloom;
- ERA5, Google Earth Engine, OpenWeatherMap, Weatherbit, AccuWeather and TerraClimate.

Catalog entries describe available sources; they do not guarantee that every variable is present in
the current agro-climate response. Feed Sync currently consumes the live water endpoint backed by
meteoblue and exposes the others for discovery. Promote another source into decision logic only after
checking its actual endpoint, spatial/temporal resolution, units, latency and license.

The EO location catalog currently exposes Kisumu dates for NDRE, NDVI, TCI and raw Sentinel-2. These
products may support regional trend views later but are not direct measurements of fish appetite,
dissolved oxygen or cage conditions.

## Failure behavior

- invalid coordinate bounds return HTTP 422 before reaching KijaniSpace;
- provider HTTP 400 becomes HTTP 422, including points not recognized as water;
- provider authentication failures become HTTP 502;
- provider availability failures become HTTP 503;
- provider schema drift becomes HTTP 502;
- dashboard summary remains HTTP 200 with `water_context: null` and `context_error` when live context
  is unavailable.
