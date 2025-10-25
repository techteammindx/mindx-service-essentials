# CRM Product & Quote Vertical Slice — TS Stack & Structure Addendum

**Date:** 2025-10-25

## Objectives & Scope Alignment
- Reaffirm the product/quote aggregates, operations, and event flow captured in [2025-10-24 brainstorm](../2025-10-24/product-quote-vertical-slice.md).
- Center external consumption on GraphQL while maintaining a gRPC facade for internal service calls.
- Showcase MongoDB persistence plus Kafka-driven `QuoteTotalsRecalculated` fanout within a teachable NestJS service.

## Recommended TypeScript Stack
| Concern | Recommendation | Rationale & References |
| --- | --- | --- |
| Framework | NestJS 10+ with Fastify adapter | Unified transport abstractions, DI, and modular layout; native GraphQL & gRPC support keeps training focused on one framework [[NestJS Docs](https://docs.nestjs.com)] |
| Language & Tooling | TypeScript 5.x, pnpm, ESLint + Prettier baseline | pnpm aligns with repo guidance; TS ensures type-safe boundaries |
| Transport Adapters | `@nestjs/graphql` (code-first), `@nestjs/microservices` gRPC transport (code-first descriptors) | Code-first keeps schema close to DTOs for both transports; gRPC facade demonstrates service-to-service flow without introducing additional HTTP transports while deriving protobuf descriptors from TypeScript definitions [[NestJS GraphQL Guide](https://docs.nestjs.com/graphql/quick-start)] [[NestJS gRPC Guide](https://docs.nestjs.com/microservices/grpc)] |
| Persistence | TypeORM MongoDB DataSource with explicit repositories | TypeORM Mongo driver maintains repository contracts while mapping to aggregates [[TypeORM Mongo Guide](https://github.com/n8n-io/typeorm/blob/master/docs/mongodb.md)] |
| Messaging | KafkaJS producers/consumers wrapped in Nest providers | Modern Node Kafka client with manual offset control via Nest context [[KafkaJS README](https://github.com/tulios/kafkajs)] [[NestJS Kafka Guide](https://docs.nestjs.com/microservices/kafka)] |
| Validation & Schema | `class-validator` / `class-transformer` for DTOs; Zod schemas exposed to clients | Keeps transport validation consistent and gives learners schema portability |
| Testing | Vitest (unit/integration), Supertest (HTTP), Pactum (contract), Testcontainers (infra) | Fast test feedback with infra parity |

## Suggested Project Structure
```
/src
  /domain              # Aggregates, value objects, domain events
  /application
    /dto               # Shared transport DTOs projected into GraphQL and gRPC
    /services          # Use cases, orchestrators, mappers
  /interface
    /graphql
      *.resolver.ts        # GraphQL resolvers per context (admin, sales, etc.)
      *.types.ts           # Code-first object/input types wrapping shared DTOs
    /grpc
      *.controller.ts      # gRPC facade adapters mirroring GraphQL resolvers
      *.schema.ts          # Code-first contract definitions for gRPC facade
  /infrastructure
    /persistence       # TypeORM Mongo entities + repositories
    /messaging         # Kafka producers, consumers, dead letter handlers
  /config              # Env loaders and validation schemas
  /bootstrap
    graphql.ts         # Fastify + GraphQL bootstrap function
    grpc.ts            # gRPC microservice bootstrap function
  main.ts              # Switches transports via TRANSPORT_MODE flag
/docker
  Dockerfile           # Service image build
  docker-compose.yaml  # Mongo, Kafka, Zookeeper, service container
  /scripts             # Optional entrypoint helpers
.dockerignore          # Filters build context for Docker image
```
- Derive protobuf descriptors at build time from `interface/grpc/*.schema.ts`, keeping transport contracts expressed in TypeScript.
- Share DTOs between transports by housing them under `src/application/dto`; export GraphQL-specific shapes by decorating those DTOs (or thin wrappers) inside `interface/graphql/*.types.ts`, letting `autoSchemaFile` emit the schema.
- Mirror container assets under `/docker`:
  - `docker-compose.yaml` orchestrates Mongo, Kafka, Zookeeper, and the service container.
  - `Dockerfile` builds the Nest service image; keep ancillary scripts (entrypoints, wait-for scripts) inside `/docker/scripts` if needed to avoid polluting the root.
  - `.dockerignore` sits at repo root filtering build context (node_modules, coverage, local logs).

## Transport Integration Notes
- **Docker Compose Bootstrap:** Build the Nest service image from the project Dockerfile and run it as a single compose service alongside Mongo, Zookeeper, and Kafka. Expose both the GraphQL and gRPC ports from that container, and drive the active transport by setting `TRANSPORT_MODE` (default `graphql`) so learners can flip transports without duplicating services.
- **GraphQL:** Enable `autoSchemaFile: true`; decorate DTO-backed object/input types inside `interface/graphql/*.types.ts`, and keep `@ResolveField` logic as thin adapters over application services [[NestJS GraphQL Guide](https://docs.nestjs.com/graphql/quick-start)]. Keep the HTTP bootstrap logic inside `bootstrap/graphql.ts` so `main.ts` can invoke it when `TRANSPORT_MODE=graphql` (default for walkthroughs).
- **gRPC:** Follow a code-first workflow: express service contracts in TypeScript (`interface/grpc/*.schema.ts`), synthesize protobuf descriptors during the build, then register `Transport.GRPC` microservices exposing the same use cases (`CreateProduct`, `AddProductToQuote`) via thin adapters; wire health checks using `grpc-health-check` to improve observability [[NestJS gRPC Guide](https://docs.nestjs.com/microservices/grpc)]. `main.ts` should proxy to `bootstrap/grpc.ts` when `TRANSPORT_MODE=grpc` to demonstrate alternate transports without duplicating configuration.
- Provide separate GraphQL resolver files (`*.resolver.ts`) inside the interface layer to highlight reuse without introducing additional transports, while keeping infrastructure focused on persistence and messaging concerns.
- Mirror the GraphQL adapters with gRPC controllers living alongside their code-first contract definitions (`interface/grpc/*.schema.ts`), so both transports expose the same application services through parallel entry points.
  - Use a build step (e.g., `pnpm proto:emit`) to synthesize descriptor sets from TypeScript definitions, keeping generated artifacts out of version control.

## Dockerfile & Container Layout
- Place the service Dockerfile under `docker/Dockerfile` so compose can reference it directly; keep build context rooted at the repository so source, lockfiles, and env templates are available.
- Use an official Node 20 (alpine or slim) base image, install `pnpm` via corepack, and copy `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` for a reproducible `pnpm install --frozen-lockfile` layer before copying application source.
- Run the same build or start command learners use locally (`pnpm build` + `pnpm start:prod` or straight `pnpm start:dev`) and expose the GraphQL HTTP port (e.g., `3000`) plus the gRPC port (`5000`) so compose port-forwards remain explicit.
- Skip host volume mounts entirely to keep containers ephemeral; rely on image-baked assets for deterministic runs.
- Set default environment variables (`TRANSPORT_MODE=graphql`, Kafka and Mongo connection strings) inside the compose service entry to mirror the documented bootstrap without embedding secrets in the image.

## Messaging Strategy
- Produce quote recalculation events through a dedicated KafkaJS provider that injects topic metadata and JSON payload validation.
- Example emission: `await producer.send({ topic: 'crm.quote.totals.recalculated.v1', messages: [{ value: JSON.stringify(event) }] })` (KafkaJS send pattern [[KafkaJS README](https://github.com/tulios/kafkajs)]).
- Consumers should disable auto-commit and call `context.getConsumer().commitOffsets(...)` after successful application-layer handling to demonstrate manual acknowledgment [[NestJS Kafka Guide](https://docs.nestjs.com/microservices/kafka)].
- Include a lightweight Dead Letter consumer showing retry vs. park behavior for educational contrast.

## Persistence Guidance
- Map aggregates to TypeORM entities using `@ObjectIdColumn()` for IDs and embed value objects via `@Column(() => MoneyEmbeddable)` [[TypeORM Mongo Guide](https://github.com/n8n-io/typeorm/blob/master/docs/mongodb.md)].
- Encapsulate Mongo query specifics (e.g., aggregation pipelines for quote totals) inside repository methods to keep application layer portable.
- Document migration approach (e.g., seed scripts + repeatable JSON migrations) since TypeORM lacks first-class Mongo migrations.

## Testing & Tooling
- Unit tests target aggregates and use cases (Vitest).
- Integration tests spin up the Nest application in-memory and execute GraphQL operations via Supertest or `@apollo/server-testing`, plus gRPC calls via generated client stubs.
- Testcontainers orchestrates Mongo + Kafka (or Redpanda) for CI to mirror docker-compose [[Harness NestJS Kafka Article](https://www.harness.io/blog/microservices-with-nestjs-kafka-and-typescript)].
- Pactum or contract snapshots ensure GraphQL schema remains aligned across resolver contexts.

## Implementation Phases
1. **Scaffold Core:** Initialize Nest project with Fastify, GraphQL, Config modules; establish base directory layout and `TRANSPORT_MODE` switch inside `main.ts` to call the appropriate bootstrap function.
2. **Domain & Application:** Implement Product/Quote aggregates, Money value object, and command/query handlers.
3. **Persistence Adapter:** Wire TypeORM DataSource, repositories, and seed script for catalog data.
4. **GraphQL Transport:** Expose create/list operations and quote mutations, emphasizing resolver reuse across contexts, and codify schema types via decorators in `*.types.ts` alongside the resolvers.
5. **gRPC Facade:** Define code-first contracts (`*.schema.ts`), emit descriptors during the build, expose quote operations for internal consumers, and add health reflection [[NestJS gRPC Guide](https://docs.nestjs.com/microservices/grpc)].
6. **Kafka Integration:** Add producer/consumer wrappers, emit `QuoteTotalsRecalculated`, and log downstream handler.
7. **Testing & Observability:** Add Vitest suites, Testcontainers harness, and structured logging defaults (Pino).

## Open Questions & Follow-Ups
- Do we mandate Redpanda or stick to vanilla Kafka for closer production parity? (Impacts docker footprint.)
- Should the descriptor-emission script live here or be centralized so multiple services share the same code-first contracts?
- What migration/seed tooling do learners expect for Mongo beyond TypeORM's limited support?
- Should GraphQL schema stitching or federation be introduced later to demonstrate multi-client integration?
