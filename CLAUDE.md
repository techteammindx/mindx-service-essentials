# Educational Intent (No Production Guidance)
- These guidelines exist strictly for training exercises; every stack and transport choice is selected to aid learner comprehension.
- Discussions, research, and implementations must avoid production, scaling, ops, or enterprise-grade assumptions unless explicitly assigned.

# Scope
- Govern all edits inside `mindx-service-essentials`, especially the slice-based `src/**` layout (domain → app → container → transport).
- Keep the training-focused vertical slices for `ping-counter` and `ping-stats` consistent so learners can trace the flow end to end.
- Apply when touching bootstrap/config glue (`src/main.ts`, `src/app.module.ts`) or any docs/walkthroughs describing the service behavior.

# Core Commands
- `context7` — primary research interface; invoke via MCP before falling back to web searches.

# Key Files & Responsibilities
- `README.md` — learner-facing project brief covering transports, env keys (`TRANSPORT_PROTOCOLS`, `DATA_SOURCE_DRIVERS`), and how slices are exercised.
- `.env.compose` — sample configuration for local Docker services (Mongo, Postgres, Kafka, RabbitMQ) plus deterministic defaults consumed by `src/config/value.ts`.
- `src/main.ts` — bootstrap hub that inspects `config.transportProtocols` and starts the GraphQL (5555), gRPC (7777), Kafka, and RabbitMQ servers.
- `src/app.module.ts` — central Nest module registering data-source adapters derived from `config.dataSourceDrivers` before pulling in slice containers.
- `src/domain/**` — pure domain layer containing aggregates (`PingCounter`, `PingStats`), value objects (`TimeInSecond`), and services with no framework dependencies.
- `src/data-source/**` — adapters for persistence and integrations (Mongo repositories, Kafka/RabbitMQ publishers, gRPC domain service clients) implementing contract interfaces.
- `src/infra/**` — infrastructure bootstrappers (GraphQL/gRPC server apps, client modules for Mongo/Kafka/Grpc) that translate env settings into runnable services.
- `src/transport/**` — interface adapters (GraphQL resolvers, gRPC controllers, Kafka consumers) that expose DTOs and map them to the corresponding app layer.
- `src/container/**` — Nest modules that bind DI tokens, slice apps, and transports together for `ping-counter` and `ping-stats`.
- `src/contract/**` — shared tokens, DTO definitions, queue payload schemas, and proto metadata coordinating the boundaries between layers.
- `docs/` — dated briefs/notes referenced during exercises; each update belongs in the correct session folder.

# Interfaces & Dependencies
- Local Docker services defined in `.env.compose`/`docker/`; Mongo (`mindx_service_essentials` DB), Postgres, Kafka (`kafka:29092`), RabbitMQ (`rabbitmq:5672`) must match docs and code.
- Runtime config flows through `TRANSPORT_PROTOCOLS`, `DATA_SOURCE_DRIVERS`, `KAFKA_BROKERS`, `GRPC_SERVICE_URL`, and `MONGO_URI`; missing or renamed keys break bootstrap.
- Async contract: `PingCounterKafkaEventPublisher` emits `PingCounterIncrementedEvent` instances on the `ping_counter.incremented` topic/pattern (Kafka + RabbitMQ), and ping-stats transports persist the same payload fields (`id`, `beforeCount`, `afterCount`, `timestamp`).
- GraphQL schema is auto-generated at runtime (`schema.gql`) from the transports; keep GraphQL types aligned with DTOs so learners can compare request/response bodies.

# Implementation Rules
- Prefer flat modules and explicit naming; do not abstract unless duplication is painful.
- Enforce KISS (Keep It Simple, Stupid): keep control flow shallow, limit helpers to single-purpose functions, avoid patterns new hires cannot trace in one pass.
- Surface full request/response flows even if mocked; optimize for readability over reuse.
- Document any learner-facing change inside the relevant dated doc folder only when assigned.
- Keep dependencies to those already present; justify any addition as essential for comprehension.
- When researching frameworks or infrastructure, prioritize Context7 MCP resources before turning to web searches.
- Maintain deterministic defaults in configs so fresh clones run without extra setup.
- Keep Docker setups ephemeral by avoiding external host volume mounts; rely on container-local storage for exercises.
- Use `pnpm` for all JavaScript package management and script execution; avoid mixing npm or Yarn commands.

# Architecture
- **Domain-Driven Design (DDD)** — Model the codebase around the domain language. Isolate domain logic in explicit domain modules, keep application services thin, and ensure training exercises expose how domain concepts map to code.
- **Hexagonal Architecture** — Structure the core domain at the center, surrounded by ports (interfaces defining contracts) and adapters (implementations for specific technologies). Keep business logic independent of external frameworks, expose adapter-to-domain boundaries clearly, and ensure learners see how dependencies flow inward toward the domain.

# Do Not Touch Unless Explicitly Instructed By User
- `.claude/` — system-managed agent state; editing breaks automation history.
- `.factory/` — tooling artifacts regenerated by automation.
- `docs/brainstorm/**` entries outside the active date — reserved for other sessions.
- `schema.gql` — generated by Nest GraphQL; never edit manually.
- `src/infra/grpc/proto/ping-counter.proto` — synced with shared contracts; modify only when explicitly assigned and regenerate clients together.
- `src/contract/infra/kafka.infra.contract.ts` / `src/contract/infra/rabbitmq.infra.contract.ts` — topic/pattern literals power every async transport; coordinate producers + consumers before changing them.
- `docker/` service names — stay aligned with `.env.compose` to keep walkthroughs reproducible.

# References
- @specs/sub-claude.md
- [docs/README.md](docs/README.md)
