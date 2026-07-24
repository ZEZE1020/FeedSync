# UI system

Feed Sync uses a compact operational design system so product work can focus on farm workflows
instead of rebuilding basic interface patterns.

## Foundations

| Element           | Choice                   | Use                                           |
| ----------------- | ------------------------ | --------------------------------------------- |
| Display type      | Manrope Variable         | Page titles, card titles and large metrics    |
| Interface type    | DM Sans Variable         | Navigation, body copy, forms and data tables  |
| Icons             | Lucide React             | One consistent 1.5–1.8 px outline icon family |
| Primary color     | Lake green `#153D30`     | Navigation, structure and trusted states      |
| Action color      | Coral `#ED7542`          | Primary actions and time-sensitive highlights |
| Supporting colors | Water blue and soft lime | Environmental context and healthy states      |

Fonts are bundled through Fontsource packages. No browser request to a third-party font CDN is
required. `apps/web/app/icon.svg` is the single source for both the application icon and Wordmark.

## Reusable components

- `Wordmark`: brand mark, product name and optional descriptor.
- `AppShell`: sidebar, mobile navigation, search, profile and page introduction.
- `MetricCard`: icon, label, value and supporting context.
- `StatusBadge`: positive, attention, information and neutral state treatments.
- `SectionHeading`: consistent section title, eyebrow and optional action slot.

Components live in `apps/web/components`. Add general-purpose patterns there; keep farm-specific
content close to its route.

## Route foundation

| Route        | Responsibility                                                 |
| ------------ | -------------------------------------------------------------- |
| `/`          | Product introduction and entry into the workspace              |
| `/dashboard` | Daily operating summary, forecast context, alerts and schedule |
| `/farms`     | Pond and cage culture-unit overview                            |
| `/feeding`   | Recommendations, plans, approvals and actual-feed workflow     |
| `/devices`   | Sensor health, feeder state and field-device freshness         |
| `/settings`  | Integration status and regional preferences                    |

Current route content is realistic demonstration data, not persisted application state. When wiring
FastAPI, preserve loading, empty, error and stale-data states and keep the `data-note` distinction
between regional forecasts and local sensors.

## Contribution rules

1. Use an existing token from `globals.css` before adding a new color.
2. Use Lucide icons rather than emoji or unrelated icon sets.
3. Keep visible measurement units and timestamps beside operational data.
4. Do not communicate health or urgency through color alone; pair it with text or an icon.
5. Test desktop and the mobile navigation breakpoint before merging UI changes.
