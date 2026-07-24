# Feed Sync API

FastAPI service for farm operations and KijaniSpace context. It keeps upstream credentials on the
server, validates provider responses, and exposes stable contracts shaped for the Feed Sync UI.

## Responsibilities

- authenticate to KijaniSpace with HTTP Basic authentication;
- normalize water forecasts and validate datasource/location responses;
- expose culture units, feed plans, devices and alerts;
- aggregate live context and operational data for the dashboard;
- provide an explainable `/v1/copilot/briefing` for daily farm priorities;
- degrade the dashboard gracefully when upstream context is unavailable.

The MVP persists feed plans in a local SQLite database (`FEED_SYNC_DB_PATH`, default
`apps/api/data/feed_sync.db`). Culture units, devices and alerts remain seeded fixtures until the
farm-management write models are introduced. Feed plans can be created, approved and marked as
executed; this gives the UI a real operational loop without sending feeder commands automatically.

## Local setup

From the repository root:

```bash
uv sync --project apps/api
cp .env.example .env
pnpm dev:api
```

Required live-data configuration:

```dotenv
KIJANISPACE_API_BASE_URL=https://api.kijanispace.eu
KIJANISPACE_USERNAME=your-username
KIJANISPACE_PASSWORD=your-password
```

The service runs at `http://localhost:3001`. OpenAPI documentation is available at
`http://localhost:3001/docs`.

For containers, the image listens on the Cloud Run-compatible `PORT` (default `8080`) and starts
`app.main:app` with Uvicorn. The local SQLite path is configurable, but should be replaced by
PostgreSQL for a multi-instance deployment.

The Docker image uses Alpine Python and a multi-stage build so only the application and its runtime
dependencies ship in the final image. Rebuild with `--no-cache` after Dockerfile changes before
comparing sizes.

Build and run the API container from this directory:

```bash
docker compose build
docker compose up
```

The host exposes the API at `http://localhost:3001`; the container listens on `8080`. Compose
persists the local SQLite database in the `feed-sync-data` volume.

## Structure

```text
app/
├── config.py           # Environment settings
├── dependencies.py     # FastAPI dependency construction
├── integrations/       # Raw KijaniSpace HTTP client
├── repositories/       # Seed data plus persisted feed-plan store
├── routers/            # Context, dashboard and operations endpoints
├── schemas/            # Provider-normalized and UI-facing contracts
└── services/           # Provider validation and normalization
tests/                  # Contract, route and integration-client tests
```

The dependency direction is `router → service/repository → integration`. Routers should not parse
raw provider dictionaries, and schemas should not perform network calls.

## Endpoint groups

- `/v1/context/*`: live KijaniSpace water, land, EO and datasource information;
- `/v1/dashboard/summary`: UI aggregate with failure-tolerant live context;
- `/v1/culture-units`: ponds and cages;
- `/v1/feed-plans`: feeding schedules and approvals;
- `/v1/devices`: sensor and feeder status;
- `/v1/alerts`: operational attention states.
- `/v1/copilot/briefing`: deterministic, evidence-backed farm briefing (LLM integration can be added later).

See [API contract](../../docs/api-contract.md) for filters, provenance and failure behavior.

## Checks

```bash
uv run --project apps/api pytest apps/api/tests
uv run --project apps/api ruff check apps/api
cd apps/api && uv run pyright app
```

When adding an endpoint, define its response schema, isolate external calls in `integrations`, add a
route test, document its source and avoid returning secrets or raw upstream errors.
