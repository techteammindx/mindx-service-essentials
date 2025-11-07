# mindx-service-essentials

Educational backend service teaching domain-driven design, hexagonal architecture, and vertical slice development using NestJS.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- pnpm (10.x per Volta pin)
- Node.js 22+

### Local Development

```bash
# Install dependencies
pnpm install

# Optionally create a local overrides file (env vars are read via process.env)
cp .env.example .env.local

# Start local infrastructure (Mongo, Postgres, Kafka, RabbitMQ)
docker compose up mongo postgres kafka zookeeper rabbitmq

# Run the Nest dev server with the transports/data sources you need
TRANSPORT_PROTOCOLS=GRAPHQL,KAFKA DATA_SOURCE_DRIVERS=MONGO,KAFKA pnpm start:dev

# GraphQL endpoint: http://localhost:5555/graphql
# gRPC endpoint: 0.0.0.0:7777 (enabled when GRPC is in TRANSPORT_PROTOCOLS)
```

### Docker Compose (All Services)

```bash
# Build and start all services
docker compose up

# GraphQL: http://localhost:5555/graphql
# gRPC: 0.0.0.0:7777
```

### Configuration

Environment variables in `.env.compose`:

| Variable | Description | Example |
| --- | --- | --- |
| `TRANSPORT_PROTOCOLS` | Comma-separated transports to bootstrap (`GRAPHQL`, `GRPC`, `KAFKA`, `RABBITMQ`). | `GRAPHQL,KAFKA` |
| `DATA_SOURCE_DRIVERS` | Comma-separated adapters to register (`MONGO`, `POSTGRES`, `KAFKA`, `GRPC`). | `MONGO,KAFKA` |
| `MONGO_URI` | Mongo connection string consumed by `MongoModule`. | `mongodb://root:root@mongo:27017/mindx_service_essentials?authSource=admin` |
| `POSTGRES_URI` | Optional Postgres connection string when enabling that driver. | `postgresql://postgres:postgres@postgres:5432/mindx_service_essentials` |
| `KAFKA_BROKERS` | Comma-separated `host:port` list shared by producer + consumer. | `kafka:29092` |
| `KAFKA_CONSUMER_GROUP_ID` | Group id for Kafka consumers (ping-stats + future slices). | `ping-service` |
| `GRPC_SERVICE_URL` | Address of the ping-counter gRPC domain service client. | `0.0.0.0:7777` |
| `RABBITMQ_URL` | Connection string used by RabbitMQ transports. | `amqp://guest:guest@rabbitmq:5672` |
| `RABBITMQ_QUEUE_NAME` | Queue name shared by RabbitMQ publishers/consumers. | `mindx_service_essentials` |
| `NODE_ENV` | Standard Node environment flag. | `development` |

Set these variables (or export them inline) before running `pnpm start:*` commands so the correct transports and data sources initialize.

#### Toggling transports & drivers

- Enable transports by listing them in `TRANSPORT_PROTOCOLS` (any mix of `GRAPHQL`, `GRPC`, `KAFKA`, `RABBITMQ`). The server only boots the transports you list.
- Register data-source adapters by listing them in `DATA_SOURCE_DRIVERS` (any mix of `MONGO`, `POSTGRES`, `KAFKA`, `GRPC`). `src/app.module.ts` wires the adapters in order so missing drivers cause DI errors.
- Combine the two lists to stage exercises: e.g., `TRANSPORT_PROTOCOLS=GRAPHQL` / `DATA_SOURCE_DRIVERS=MONGO` for a pure request-response walkthrough, or add `KAFKA` to both lists to demo async propagation into ping-stats.
- Defaults live in `.env.compose`, while `.env.example` provides the minimal local values to copy when not using Docker.

## Architecture

### Domain-Driven Design
- `src/domain/**` holds the ubiquitous language: `PingCounter` aggregate + incremented domain event, and the `PingStats` projection service. These modules contain all invariants, value objects, and business rules with zero NestJS imports.
- Application services in `src/app/**` coordinate the aggregates through ports declared under `src/contract/app/**`. `PingCounterDomainApp` mutates state and emits events, while `PingCounterAPILayerApp` exposes a read-only view; `PingStatsDomainApp` maps transport DTOs into query ranges and save commands.
- Vertical slices keep the domain visible end to end. Every slice (ping-counter, ping-stats) carries its own domain, app, container, infra, and transport pieces so learners can trace request → domain → persistence within a single folder chain.

### Hexagonal layering
- Ports: contracts inside `src/contract/**` define repositories, event publishers, domain services, DTOs, and DI tokens. Application services depend on these abstractions only.
- Adapters: infrastructure-specific implementations live in `src/data-source/**` (Mongo repositories, Kafka/RabbitMQ publishers, gRPC domain clients) and `src/transport/**` (GraphQL resolvers, gRPC controllers, Kafka consumers). They translate external protocols into domain commands/events.
- Containers (`src/container/**`) wire the adapters to their ports, building each slice’s hexagon. `AppModule` registers whichever driver modules (`MongoModule`, `KafkaClientModule`, `GrpcClientModule`, etc.) match `DATA_SOURCE_DRIVERS`.
- Bootstrap (`src/main.ts`) inspects `TRANSPORT_PROTOCOLS` at runtime and spins up the GraphQL (5555), gRPC (7777), Kafka, and/or RabbitMQ servers, demonstrating how ports/adapters remain swappable without touching the core domain.

### Project Structure

```
src/
├── app/            # Slice-level application services + DTO mappers
├── container/      # Nest modules wiring DI tokens and transports per slice
├── config/         # zod schemas + runtime config values
├── contract/       # Shared DI tokens, DTOs, queue payloads, proto metadata
├── data-source/    # Repositories, event publishers, and domain service adapters
├── domain/         # Aggregates, value objects, domain services
├── infra/          # Server bootstrappers (GraphQL/gRPC/Kafka/RabbitMQ, Mongo/Kafka/Grpc clients)
├── transport/      # GraphQL resolvers, gRPC controllers, Kafka consumers
├── app.module.ts   # Registers data sources + slice containers
└── main.ts         # Enables transports based on TRANSPORT_PROTOCOLS
```

Each folder carries both `ping-counter` and `ping-stats` slices to keep the full request/response path visible to learners.

## Vertical slice walkthroughs

**Ping Counter (write path)**
- Hit the GraphQL or gRPC transport to run `PingCounterApp`. The aggregate enforces invariants and emits `PingCounterIncrementedEvent`.
- Data-source drivers persist the latest counter (Mongo/Postgres) and publish the incremented event via Kafka or RabbitMQ when those drivers are enabled.

**Ping Stats (read path)**
- Kafka/RabbitMQ transports consume the `ping_counter.incremented` topic/pattern, deserialize the `PingCounterIncrementedEvent`, and call `PingStatsApp`.
- The stats slice writes the `(seconds, value)` pair so learners can see eventual consistency between the counter and stats projections.

**End-to-end exercise**
1. Start Docker services plus the Nest dev server with `TRANSPORT_PROTOCOLS=GRAPHQL,KAFKA` and `DATA_SOURCE_DRIVERS=MONGO,KAFKA`.
2. Run the `incrementPingCounter` mutation. The response shows the updated counter immediately.
3. Watch the dev server logs for `Received kafka event...` from `ping-stats`. Query Mongo (or expose a resolver) to observe the stats projection catching up.

## GraphQL API

Available at `http://localhost:5555/graphql` when `TRANSPORT_PROTOCOLS` includes `GRAPHQL`. The schema is generated at runtime from the transports:

```graphql
type Query {
  get: PingCounter!
  getPingStats(input: PingStatsQueryInput!): PingStatsQueryResult!
}

type Mutation {
  ping: PingCounter!
}

type PingCounter {
  id: ID!
  count: Int!
  lastPingedAt: Float!
  createdAt: Float!
}

input PingStatsQueryInput {
  timeFrame: PingStatsQueryTimeFrame!
}

type PingStatsQueryResult {
  items: [PingStats!]!
}

type PingStats {
  id: ID!
  value: Int!
  seconds: Int!
}

enum PingStatsQueryTimeFrame {
  Last5Minute
  LastHour
}
```

### Sample operations

```graphql
# Increment the counter and read the latest values
mutation {
  ping {
    id
    count
    lastPingedAt
    createdAt
  }
}

# Query the latest counter plus stats projections for the last 5 minutes
query {
  get {
    id
    count
    lastPingedAt
    createdAt
  }
  getPingStats(input: { timeFrame: Last5Minute }) {
    items {
      id
      seconds
      value
    }
  }
}
```

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```
