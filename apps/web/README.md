# Feed Sync web application

Next.js App Router interface for daily cage and pond operations. The current routes establish the
visual language and realistic screen states teammates can connect to FastAPI.

## Local setup

From the repository root:

```bash
pnpm install
pnpm dev:web
```

The application runs at `http://localhost:3000`. Next.js uses Turbopack by default.

## Routes

| Route        | Responsibility                                      |
| ------------ | --------------------------------------------------- |
| `/`          | Product introduction                                |
| `/dashboard` | Daily context, metrics, alerts and feeding schedule |
| `/farms`     | Pond and cage culture units                         |
| `/feeding`   | Plans, recommendations and approvals                |
| `/devices`   | Sensor and feeder health                            |
| `/settings`  | Integration and regional preferences                |

Route content is currently presentation data. The matching backend resources are documented in the
[API contract](../../docs/api-contract.md). When connecting a page, use a typed server-side API
module, expose loading/error/stale states and do not move KijaniSpace credentials into Next.js.

## UI structure

```text
app/                    # Routes, metadata, icon and global tokens
components/brand/       # Feed Sync identity
components/layout/      # Responsive application shell
components/ui/          # Reusable presentation primitives
```

Manrope Variable is used for display type, DM Sans Variable for interface text, and Lucide React for
icons. `app/icon.svg` is the canonical brand mark. See the [UI system](../../docs/ui-system.md) before
adding colors, icons or common components.

## Checks

```bash
pnpm --filter @feed-sync/web lint
pnpm --filter @feed-sync/web typecheck
pnpm --filter @feed-sync/web build
```

Keep route-specific content in its route. Promote a pattern into `components/ui` only when it is
genuinely reusable, and preserve accessible labels, visible units and responsive behavior.
