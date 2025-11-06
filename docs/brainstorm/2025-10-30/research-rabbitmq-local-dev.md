# RabbitMQ Local Dev Stack Research

## Scope & Goals
- Provide a minimal RabbitMQ broker plus management UI that learners can run locally via Docker Compose.
- Keep everything single-node, ephemeral (no external volumes), and aligned with the training stack conventions.
- Document implications for existing scripts, env vars, and service defaults in `mindx-service-essentials`.

## Current Repository Observations
- The compose stack currently provisions MongoDB, PostgreSQL, Kafka, Zookeeper, and the app container—no RabbitMQ service yet (`docker/docker-compose.yaml`).
- Application defaults assume a local broker at `amqp://localhost:5672` and queue `mindx_service_essentials` with `durable: false` (`src/setup/setup.rabbitmq.app.ts`).
- Config-driven registration expects `RABBITMQ_URL`, `RABBITMQ_QUEUE_NAME`, and optional `ASYNC_TRANSPORT_PROTOCOL=RABBITMQ` (`src/infra/rabbitmq/rabbitmq.module.ts`, `src/config/value.ts`).
- Infra bootstrap script hard-codes four health checks (Mongo, Zookeeper, Kafka, Postgres) and would need explicit RabbitMQ readiness handling if the service is added (`scripts/bootstrap-infra.sh`).

## External Findings
- Official RabbitMQ Docker images provide `rabbitmq:<version>-management` tags with the HTTP UI exposed on port `15672`; defaults remain `guest` / `guest` but credentials can be overridden using `RABBITMQ_DEFAULT_USER` and `RABBITMQ_DEFAULT_PASS` for non-loopback access ([Docker Hub rabbitmq image](https://hub.docker.com/_/rabbitmq)).
- Minimal Compose examples typically expose `5672` (AMQP) and `15672` (UI) and run the broker on an internal bridge network without persistence for throwaway environments ([docker-rabbitmq-example](https://github.com/dmaze/docker-rabbitmq-example/blob/master/docker-compose.yml)).
- Single-container setups that only need the management UI can stay on the management image without additional plugins or config files; plugin enablement via `/etc/rabbitmq/enabled_plugins` is optional for advanced cases (Context7 `/rabbitmq/rabbitmq-website`, Docker Hub docs).

## Option Overview

### Option 1 – Inline broker in existing Compose file
- **Description:** Add a `rabbitmq` service using `rabbitmq:4.1-management` (or the training stack's preferred LTS) to `docker/docker-compose.yaml`.
- **Pros:** Simple for learners; aligns with current infra scripts; UI available at `http://localhost:15672`.
- **Cons:** Requires updating bootstrap health checks and `.env.compose` defaults; Compose file becomes larger.
- **Fit:** Best match for “default, minimal configs” while keeping everything discoverable in one file.

### Option 2 – Separate learner-specific compose override
- **Description:** Provide `docker/docker-compose.rabbitmq.yaml` and instruct learners to run `docker compose -f ... up`.
- **Pros:** Keeps base stack unchanged for exercises not using RabbitMQ.
- **Cons:** Adds orchestration complexity; scripts like `bootstrap-infra.sh` would need optional file handling.
- **Fit:** Only useful if RabbitMQ should remain opt-in; lower clarity for newcomers.

## Implementation Guidance (if Option 1 is chosen)
- Use `rabbitmq:management` tag so the management plugin is pre-enabled; latest stable (`4.1.x` today) keeps alignment with other services.
- Expose ports `5672:5672` and `15672:15672`; keep the service on the existing `mindx_service_essentials` network for container-to-container DNS.
- Provide deterministic defaults in `.env.compose`, e.g. `RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672` and `RABBITMQ_QUEUE_NAME=mindx_service_essentials`.
- Keep the broker stateless by omitting volumes; highlight that data resets on container restart.
- Update bootstrap health checks with a simple readiness probe such as ``docker exec mindx_service_essentials_rabbitmq rabbitmq-diagnostics check_running`` and bump the expected service count.
- Verify NestJS client config resolves to the container hostname via `configService` (short example: ``urls: ['amqp://rabbitmq:5672']``).

## Follow-up Questions
- Should the training exercises demonstrate custom credentials, or stick with `guest`/`guest` to reduce setup friction?
- Do we want RabbitMQ enabled by default in `bootstrap-infra.sh`, or should it be opt-in to keep startup faster for Kafka-focused modules?
- Is there a need to document switching `ASYNC_TRANSPORT_PROTOCOL` between Kafka and RabbitMQ within the learner flow?
- Are additional scripts (e.g., teardown) expected to purge RabbitMQ-specific resources, or is container removal sufficient?

## Suggested Next Steps
- Decide between Option 1 and Option 2 based on learner workflow priorities.
- Confirm the desired RabbitMQ image tag version and update `.env.compose` plus Compose accordingly.
- Plan bootstrap and teardown script adjustments to keep the developer experience consistent once RabbitMQ is included.
