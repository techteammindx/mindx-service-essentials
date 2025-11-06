**Change Request:** Capture minimal ping slice that touches all layers via ping flow, supporting GraphQL/gRPC toggles, Mongo/Postgres persistence selection, and Kafka event emission/consumption.

**Dependencies & Context:** Aligned with `docs/brainstorm/2025-10-25` specs; relies on `.env.compose` toggles (`TRANSPORT_MODE`, `PERSISTENCE_DRIVER`) and TypeORM + KafkaJS patterns already favored. Compose stack must host Mongo, Postgres, and Kafka services.

**Brief Structure Decisions:** Emphasized domain aggregate creation with explicit increment method, dual persistence adapters, transport parity, and in-service Kafka loop. Included deployment config prep, explicit Dockerfile build requirement, and mandated Vitest/integration coverage to validate round-trip behavior.
