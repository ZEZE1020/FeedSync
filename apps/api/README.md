# Feed Sync API

FastAPI service for farm operations and KijaniSpace context. It keeps upstream credentials on the
server, validates provider responses, and exposes stable contracts shaped for the Feed Sync UI.

## Responsibilities

- authenticate to KijaniSpace with HTTP Basic authentication;
- normalize water forecasts and validate datasource/location responses;
- expose culture units, feed plans, devices and alerts;
- aggregate live context and operational data for the dashboard;
- degrade the dashboard gracefully when upstream context is unavailable.

It does not currently persist farm data, authenticate Feed Sync users, or send commands to devices.
Operational responses are explicitly marked as demo data where applicable.

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

## Structure

```text
app/
├── config.py           # Environment settings
├── dependencies.py     # FastAPI dependency construction
├── integrations/       # Raw KijaniSpace HTTP client
├── repositories/       # Temporary demo operational data
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

See [API contract](../../docs/api-contract.md) for filters, provenance and failure behavior.

## Checks

```bash
uv run --project apps/api pytest apps/api/tests
uv run --project apps/api ruff check apps/api
cd apps/api && uv run pyright app
```

When adding an endpoint, define its response schema, isolate external calls in `integrations`, add a
route test, document its source and avoid returning secrets or raw upstream errors.

