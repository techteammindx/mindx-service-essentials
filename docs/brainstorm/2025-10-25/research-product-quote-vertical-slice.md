# CRM Product & Quote Vertical Slice — TypeScript Stack Research

**Date:** 2025-10-25

## TL;DR
- Build a single NestJS application (Fastify HTTP adapter) to host REST controllers, GraphQL resolvers, and a gRPC microservice facade so every transport shares the same application-layer use cases (NestJS GraphQL & gRPC docs).
- Adopt pnpm for workspace management, class-transformer/validator for DTO enforcement, and Zod for transport-level schemas that stay framework-agnostic.
- Use MongoDB via TypeORM DataSource for aggregate persistence, with alternative Mongo-first stacks (Prisma Client Mongo, pure Mongoose) evaluated when schema tooling outweighs unified APIs (TypeORM Mongo docs, Prisma Mongo docs).
- Use Redpanda (Kafka API compatible) in Docker Compose for QuoteTotalsRecalculated events with KafkaJS producers/consumers; bundle Redpanda Console for local inspection (Redpanda single-broker lab, KafkaJS consumer guide).
- Standardize on Vitest + Supertest for fast integration checks, Testcontainers for orchestrating Mongo/Redpanda in CI, and Pactum for transport contract snapshots.

## Internal Signals
- Current repository lacks package.json or existing TS services, so all stack choices must be introduced greenfield.
- Brainstorm brief emphasizes DDD aggregates, transport parity (REST + GraphQL), and an eventual gRPC layer, guiding toward a framework with first-class modular boundaries.

## Service Architecture
- **Domain layer:** Plain aggregates/value objects (Product, Quote, Money) in `/src/domain`, pure logic with no framework imports.
- **Application layer:** Use-case handlers (`CreateProduct`, `AddProductToQuote`) wrapping repositories + domain services; expose via CQRS-style commands/queries.
- **Interface layer:**
  - REST controllers using Nest routing annotations.
  - GraphQL resolvers defined with code-first decorators to reuse DTOs (`@Resolver`, `@Mutation`).
  - gRPC service definitions generated from proto files, registered with `ClientsModule.register` using Nest microservice transport.
- **Infrastructure adapters:** Repositories, Kafka publishers, persistence mappers isolated under `/src/infrastructure` to keep replacement friction low.
- **Configuration:** Use `@nestjs/config` with environment validation, splitting env files per docker-compose profile.

## Transport Strategy
- **HTTP layer:** Choose Fastify adapter for better throughput; Nest provides Mercurius driver to mount GraphQL alongside REST (NestJS GraphQL quick start).
- **GraphQL schema:** Code-first approach keeps schema synced with DTO classes; enable GraphiQL in dev for quick exploration.
- **gRPC:** Generate TypeScript classes via `ts-proto`; register service with Nest microservices module to keep request metadata minimal (gRPC docs highlight decorator mapping).
- **Validation:** class-validator for incoming REST/GraphQL payloads; Zod schemas exported for clients and used in e2e contract tests.

## Persistence Options
| Option | Summary | Pros | Cons | Fit |
| --- | --- | --- | --- | --- |
| **TypeORM (Mongo)** | Use TypeORM’s MongoDB driver with decorators and repository interfaces | Keeps same entity model across layers, integrates cleanly with Nest DI, leverages `@ObjectIdColumn` | Limited native migration story, aggregation pipelines require raw queries | Default choice to keep adapters aligned with existing TypeORM patterns |

**Recommendation:** Adopt TypeORM’s Mongo integration to keep repository interfaces uniform while persisting aggregates in MongoDB; layer aggregation helpers or raw queries where richer pipeline support is required.

## Messaging & Events
- Use Redpanda single-broker compose profile for Kafka-compatible dev stack with console UI (Redpanda single-broker lab).
- Produce events with KafkaJS `producer.send` and consume with KafkaJS consumer groups (KafkaJS consumer guide); wrap in NestJS custom provider to keep infra behind ports.
- Define topic naming convention (`crm.quote.totals.recalculated.v1`) and embed JSON payload validated by Zod.
- For local dev, add optional dead-letter topic handled by a lightweight worker service to showcase resiliency.

## Dev Tooling & Testing
- **Runtime:** Node.js 20 (LTS), TypeScript 5.x, pnpm for deterministic installs.
- **Workspace orchestration:** Rely on pnpm scripts for task orchestration to keep the toolchain fully self-contained in this repo.
- **Testing:**
  - Vitest for unit + integration (fast, ESM-ready).
  - Supertest against the Nest HTTP server.
  - Testcontainers Node to spin Mongo/Redpanda in CI for parity with docker-compose.
  - Pactum or custom snapshot harness to ensure REST and GraphQL stay aligned.
- **Observability:** Integrate Pino logger through Nest’s LoggerService; expose OpenTelemetry traces via `@nestjs/otel` module if needed.

## Docker Compose Blueprint
- Core services: `app` (Nest dev server with `command: ["pnpm","run","start:dev"]`), `mongo` (6+), `redpanda` plus `redpanda-console`, optional `graphql-playground` container if needed.
- Use a shared `crm_network`, persistent volumes for Mongo, and environment files to inject connection strings consumed by `@nestjs/config`.
- Expose Redpanda’s Kafka port 19092 for host connections; include `depends_on` to ensure database availability before app bootstrap.
- Provide make-style scripts (`pnpm db:migrate`, `pnpm db:seed`) executed via `docker compose exec app` to align onboarding.

## Implementation Sequencing
1. Scaffold Nest workspace with pnpm, enable Fastify + GraphQL + Config modules.
2. Model domain aggregates/value objects and define repository/use-case interfaces.
3. Implement Mongo-backed repositories + migrations; wire REST + GraphQL endpoints.
4. Integrate KafkaJS publisher/consumer and emit `QuoteTotalsRecalculated`.
5. Layer gRPC transport once core flows stabilize.

## Clarifying Questions
- Are we expected to rely on TypeORM migrations for Mongo, or can we introduce an external migration runner (Prisma, Mongock)?
- Is Redpanda acceptable for Kafka semantics, or do we need vanilla Kafka for parity with production infrastructure?
- Do we require API Gateway concerns (auth, rate limiting) beyond simple role checks during the slice?

## Risks & Follow-ups
- TypeORM Mongo capability is functional but less battle-tested; evaluate early with load tests.
- Running Mongo and Redpanda together increases resource footprint—document minimal compose profile for CI.
- Need decision on protobuf ownership for gRPC service to avoid rebuild churn.
- Pending answers to clarifying questions before finalizing package selection and migration tooling choice.
