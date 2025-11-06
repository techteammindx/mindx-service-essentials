# Brief Log — Add Postgres Infra Support

- Request: add Postgres container alongside Mongo with empty datasets and no persistence driver toggles.
- Key files reviewed: `docker/docker-compose.yaml`, `.env.compose`, `scripts/bootstrap-infra.sh`, `scripts/teardown-infra.sh`, `docs/brainstorm/2025-10-25/server-product-spec.md`.
- Design choices: run Mongo and Postgres together, align env URIs, extend scripts for unconditional start/stop, add smoke verification to keep both stores empty.
