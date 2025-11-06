# Ping Domain Service Refactor Brief

## Context
- Review: `src/application/services/ping.service.ts`, `src/domain/ping/*`, `src/application/dto/ping.dto.ts`, `src/application/ports/kafka-publisher.port.ts`, `src/domain/ping/ping-counter.repository.ts`, Nest module wiring under `src/app.module.ts`.
- Breaking changes accepted by default.

## Steps
1. **Introduce Domain Use Cases** – Create `src/domain/ping/use-cases/increment-ping-counter.usecase.ts` (and co-locate future handlers) with `src/domain/ping/use-cases/index.ts` exporting `createPingUseCases(repo, publisher)`.
   - *Acceptance*: Increment handler persists aggregates, emits events post-save, returns primitives-only payloads; index exposes factory without circular dependencies.
2. **Model Domain Errors** – Define domain-specific exceptions (e.g., `PingCounterNotFoundError`) within domain layer.
   - *Acceptance*: Application layer receives typed errors; missing counter paths no longer throw generic `Error`.
3. **Refine Aggregate Primitives** – Extend `PingCounter` with `toPrimitives()` returning plain data (ISO strings for dates).
   - *Acceptance*: Specs updated/added to cover new projection method; no class instances cross domain boundary.
4. **Update Application Service** – Refactor `PingService` to resolve use-case factory (via DI) and delegate to use-case methods while handling DTO/logging/error translation only.
   - *Acceptance*: Service no longer references repository/publisher directly; transport contracts stay unchanged.
5. **Adjust Tests** – Add unit tests for the increment use case; update application service tests to mock the factory output.
   - *Acceptance*: Vitest suite green with error scenarios covered for both layers.
6. **Wire Providers** – Register factory/provider bindings so Nest injects repository and publisher into `createPingUseCases`, exposing increment handler to the application service.
   - *Acceptance*: Application bootstrap works without overrides; GraphQL/gRPC continue through updated service.

## Deployment
- Prepare deployment configs: verify `.env.compose` and `docker/docker-compose.yaml` require no new variables; otherwise document additions.
