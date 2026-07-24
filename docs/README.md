# Feed Sync documentation

Use this index to find the authoritative document for a decision or workflow. Domain READMEs cover
how to work inside a directory; these documents explain cross-system behavior and product choices.

## Start here

| Need                            | Document                                       |
| ------------------------------- | ---------------------------------------------- |
| Understand the system           | [Architecture](architecture.md)                |
| Run or extend FastAPI           | [API README](../apps/api/README.md)            |
| Find an endpoint or datasource  | [API contract](api-contract.md)                |
| Understand KijaniSpace behavior | [API integration](api-integration.md)          |
| Work on Next.js                 | [Web README](../apps/web/README.md)            |
| Reuse UI components and tokens  | [UI system](ui-system.md)                      |
| Compare cages and ponds         | [Culture-system alignment](culture-systems.md) |
| Work with Arduino hardware      | [Firmware README](../firmware/README.md)       |
| Review product priorities       | [Feature recommendations](features.md)         |

## Decision records

- [ADR 0001: Polyglot monorepo with independent firmware](adr/0001-monorepo.md)

## Documentation ownership

- update a domain README when its setup, structure or local commands change;
- update `api-contract.md` when a route, filter, response source or failure behavior changes;
- update `ui-system.md` when adding a token, shared component, font or icon convention;
- add an ADR for a durable architectural choice that is difficult to reverse;
- avoid copying the same instructions into multiple documents—link to the authoritative source.
