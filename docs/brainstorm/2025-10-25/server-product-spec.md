# CRM Product & Quote Vertical Slice — TypeScript Stack Research

**Date:** 2025-10-25

## TL;DR
- Build a single NestJS application (Fastify HTTP adapter) to host REST controllers, GraphQL resolvers, and a gRPC microservice facade so every transport shares the same application-layer use cases (NestJS GraphQL & gRPC docs).
- Adopt pnpm for workspace management, class-transformer/validator for DTO enforcement, and Zod for transport-level schemas that stay framework-agnostic.
- Use TypeORM DataSources for aggregate persistence, defaulting to MongoDB while allowing a Postgres swap controlled via configuration (TypeORM Mongo docs, TypeORM Postgres docs).
- Use Redpanda (Kafka API compatible) in Docker Compose for QuoteTotalsRecalculated events with KafkaJS producers/consumers; bundle Redpanda Console for local inspection (Redpanda single-broker lab, KafkaJS consumer guide).
- Standardize on Vitest + Supertest for fast integration checks, Testcontainers for orchestrating Mongo/Redpanda in CI, and Pactum for transport contract snapshots.

## Internal Signals
- **Project Status**: mindx-service-essentials is a greenfield training project demonstrating NestJS microservice patterns.
- **Scope**: Build a single NestJS service implementing CRM Product & Quote domain with multiple transports (REST, GraphQL, gRPC).
- **Design Principles**:
  - DDD aggregates with domain-driven behavior (Product, Quote, Money value objects)
  - Transport parity: REST + GraphQL share same application-layer use cases
  - Event-driven messaging for cross-service communication (Kafka/Redpanda)
  - 3-Layer architecture: Domain (pure logic) → Module (application use cases) → Infrastructure (adapters)

## Service Architecture
- **Domain layer:** Plain aggregates/value objects (Product, Quote, Money) in `/src/domain`, pure logic with no framework imports.
- **Application layer:** Use-case handlers (`CreateProduct`, `AddProductToQuote`) wrapping repositories + domain services; expose via CQRS-style commands/queries.
- **Interface layer:**
  - REST controllers using Nest routing annotations.
  - GraphQL resolvers defined with code-first decorators to reuse DTOs (`@Resolver`, `@Mutation`).
  - gRPC service definitions generated from proto files, registered with `ClientsModule.register` using Nest microservice transport.
- **Infrastructure adapters:** Repositories, Kafka publishers, persistence mappers isolated under `/src/infrastructure` to keep replacement friction low.
- **Configuration:** Use `@nestjs/config` with environment validation, splitting env files per docker-compose profile, and load a `PERSISTENCE_DRIVER` flag (`mongo` or `postgres`) from `.env.compose` so only one database adapter boots per instance.

## Transport Strategy
- **HTTP layer:** Choose Fastify adapter for better throughput; Nest provides Mercurius driver to mount GraphQL alongside REST (NestJS GraphQL quick start).
- **GraphQL schema:** Code-first approach keeps schema synced with DTO classes; enable GraphiQL in dev for quick exploration.
- **gRPC:** Generate TypeScript classes via `ts-proto`; register service with Nest microservices module to keep request metadata minimal (gRPC docs highlight decorator mapping).
- **Validation:** class-validator for incoming REST/GraphQL payloads; Zod schemas exported for clients and used in e2e contract tests.

## Persistence Options
| Option | Summary | Pros | Cons | Fit |
| --- | --- | --- | --- | --- |
| **TypeORM (Mongo)** | Use TypeORM's MongoDB driver with decorators and repository interfaces | Keeps same entity model across layers, integrates cleanly with Nest DI, leverages `@ObjectIdColumn` | Limited native migration story, aggregation pipelines require raw queries | Default choice to keep adapters aligned with existing TypeORM patterns |
| **TypeORM (Postgres 17)** | Point the same repository interfaces at a Postgres DataSource | Demonstrates relational adapter swap without touching domain/application layers; unlocks SQL-friendly reporting later | Requires separate Docker service and connection string management; migrations deferred until later exercises | Optional; enable when exploring relational persistence |
**Recommendation:** Keep TypeORM repositories as the persistence boundary—run with Mongo when `PERSISTENCE_DRIVER=mongo` (default) and switch to Postgres by setting `PERSISTENCE_DRIVER=postgres` so learners can see architecture parity without changing domain flow.

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

## Docker Compose Infrastructure (Actual Implementation)
**Location:** `docker/docker-compose.yaml`

**Services Deployed:**
1. **MongoDB 6.0** (`mindx_service_essentials_mongo`)
   - Port: 27017
   - Health check: mongosh admin ping with 10s interval
   - Environment: Root user/password, database name

2. **Zookeeper 7.5.0** (`mindx_service_essentials_zookeeper`)
   - Port: 2181
   - Kafka coordinator service
   - Health check: TCP netcat probe

3. **Kafka 7.5.0** (`confluentinc/cp-kafka`)
   - Broker ID: 1
   - Ports: 9092 (internal PLAINTEXT), 29092 (inter-broker)
   - Auto-creates topics on demand
   - Depends on: Zookeeper (service_healthy)
   - Health check: kafka-topics list command

4. **Network:** `mindx_service_essentials` (bridge driver)

5. **PostgreSQL 17** (`mindx_service_essentials_postgres`)
   - Port: 5432
   - Health check: pg_isready probe with 10s interval
   - Environment: User/password, database name
   - Used when `PERSISTENCE_DRIVER=postgres` in application configuration

**Environment Configuration:**
- `.env.compose` - Mongo/Postgres URIs, persistence driver toggle, Kafka brokers (kafka:29092), consumer group ID, topic naming
  ```
  MONGO_URI=mongodb://root:root@mongo:27017/mindx_service_essentials?authSource=admin
  POSTGRES_URI=postgresql://postgres:postgres@postgres:5432/mindx_service_essentials
  PERSISTENCE_DRIVER=mongo
  KAFKA_BROKERS=kafka:29092
  KAFKA_CONSUMER_GROUP_ID=crm-app
  KAFKA_TOPIC_QUOTE_TOTALS_RECALCULATED=crm.quote.totals.recalculated.v1
  ```

**Automation Scripts:**
- `scripts/bootstrap-infra.sh` - Starts stack with health checks (120s timeout), `--detached` flag support
- `scripts/run-infra-tests.sh` - Smoke tests: REST health, GraphQL introspection, gRPC check, Kafka connectivity
- `scripts/teardown-infra.sh` - Cleanup: stops containers, prunes volumes, removes artifacts; `--force` and `--volumes-only` flags

**Status:** Infrastructure layer complete. NestJS application scaffolding pending.

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
