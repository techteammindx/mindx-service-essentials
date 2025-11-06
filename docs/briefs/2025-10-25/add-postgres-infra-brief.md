# Add Postgres Infra Support Brief

Review before execution: `docker/docker-compose.yaml`, `.env.compose`, `scripts/bootstrap-infra.sh`, `scripts/teardown-infra.sh`.

1. Add a `postgres` service (image `postgres:17-alpine`) to compose with shared bridge network, `pg_isready` healthcheck, and no seed-mounted volumes. Acceptance: service reaches healthy state and containers stay empty.
2. Append Postgres credentials and `POSTGRES_URI=postgresql://postgres:postgres@postgres:5432/mindx_service_essentials` to `.env.compose`. Acceptance: file loads without missing variable errors and mirrors Mongo style.
3. Update `scripts/bootstrap-infra.sh` to start all four services and wait on Mongo and Postgres healthchecks without driver flags. Acceptance: running script launches both databases cleanly and exits success.
4. Adjust `scripts/teardown-infra.sh` to stop Mongo, Postgres, Kafka, and Zookeeper unconditionally and prune optional volumes. Acceptance: script removes containers even if already stopped and leaves no seed data.
5. Add a bootstrap smoke check invoking `docker exec` + `psql -lqt` to confirm empty databases. Acceptance: command reports zero user tables for both stores.
6. Prepare deployment configs by syncing compose/env changes with any CI profiles referencing the stack. Acceptance: CI uses the new Postgres URI without additional toggles.
7. Remove dead persistence toggles or docs referencing `PERSISTENCE_DRIVER`. Acceptance: repository contains no stale flags and scripts/docs align with dual-database setup.
