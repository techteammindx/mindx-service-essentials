# Docker Compose Infra Setup Brief

1. Re-read `docs/brainstorm/2025-10-25/research-product-quote-vertical-slice.md` and catalogue required services, transports, and tooling assumptions for the infra slice.
   - Acceptance Criteria: Checklist enumerates app, mongo, redpanda, console, and test tooling expectations.
2. Design repository layout additions: propose `docker/`, `scripts/`, and `config/` folders plus pnpm workspace stubs aligning with the NestJS stack.
   - Acceptance Criteria: Directory plan is approved and avoids conflicts with existing paths.
3. Author `docker/docker-compose.yaml` defining Nest app, Mongo 6+, Redpanda, and Redpanda Console with shared network, healthchecks, and named volumes.
   - Acceptance Criteria: Compose file validates via `docker compose config` and container dependencies declare ready conditions.
4. Prepare deployment configs by drafting `.env.compose` and app config templates consumed via `@nestjs/config`, mapping compose hostnames and ports.
   - Acceptance Criteria: Environment files list connection URIs, Kafka brokers, and app secrets without placeholder values.
5. Create `scripts/bootstrap-infra.sh` to start the compose stack, wait for health endpoints, and surface logs on failure.
   - Acceptance Criteria: Script exits non-zero when services stay unhealthy and supports a `--detached` flag.
6. Add `scripts/run-infra-tests.sh` invoking pnpm commands to exercise REST, GraphQL, and gRPC smoke checks against the running stack.
   - Acceptance Criteria: Script fails when any HTTP 500, GraphQL error, or gRPC status other than OK occurs.
7. Define cleanup workflow removing stale containers, volumes, and generated test fixtures post-run.
   - Acceptance Criteria: `scripts/teardown-infra.sh` prunes the compose stack and leaves the workspace clean.
