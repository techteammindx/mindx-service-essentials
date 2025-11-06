# mindx-service-essentials

Educational backend service teaching domain-driven design, hexagonal architecture, and vertical slice development using NestJS.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- pnpm (or npm/yarn)
- Node.js 20+

### Local Development

```bash
# Install dependencies
pnpm install

# Start infrastructure (Mongo, Postgres, Kafka)
docker compose up mongo postgres kafka zookeeper

# Run development server (GraphQL mode)
pnpm start:dev

# GraphQL endpoint: http://localhost:3000/graphql
```

### Docker Compose (All Services)

```bash
# Build and start all services
docker compose up

# GraphQL: http://localhost:3000/graphql
# gRPC: localhost:5000
```

### Configuration

Environment variables in `.env.compose`:

| Variable | Values | Default |
| --- | --- | --- |
| `PERSISTENCE_DRIVER` | `mongo` \| `postgres` | `mongo` |
| `TRANSPORT_MODE` | `graphql` \| `grpc` | `graphql` |
| `KAFKA_BROKERS` | Broker list | `kafka:29092` |

## Architecture

### Domain-Driven Design (DDD)
- **Aggregates**: `PingCounter` with invariant validation
- **Domain Events**: `PingEvent` ensures count increment integrity
- **Value Objects**: Embedded in aggregates

### Hexagonal Architecture
- **Domain Core**: Business logic isolated from frameworks
- **Application Layer**: Use cases and ports (interfaces)
- **Infrastructure**: Adapters for Mongo, Postgres, Kafka
- **Interface**: GraphQL resolvers and gRPC controllers

### Project Structure

```
src/
├── domain/          # Aggregates, domain events, ports
├── application/     # DTOs, services, application ports
├── infrastructure/  # Persistence, messaging adapters
├── interface/       # GraphQL, gRPC, HTTP controllers
├── config/          # Configuration factories
├── bootstrap/       # Transport entry points
└── main.ts          # TRANSPORT_MODE switch
```

## GraphQL API

### Mutations

```graphql
mutation {
  incrementPingCounter(input: { id: "counter-1" }) {
    id
    count
    lastPingedAt
    createdAt
  }
}
```

### Queries

```graphql
query {
  getPingCounter(input: { id: "counter-1" }) {
    id
    count
    lastPingedAt
    createdAt
  }

  getAllPingCounters {
    id
    count
    lastPingedAt
    createdAt
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

## Implementation Highlights

✅ **Persistence Flexibility**: Switch between MongoDB and PostgreSQL via environment flag
✅ **Transport Agnostic**: GraphQL and gRPC expose identical business logic
✅ **Event-Driven**: Kafka integration for async counter updates
✅ **Type-Safe**: TypeScript with strict null checks throughout
✅ **Well-Tested**: Unit tests for aggregates, services, and adapters
✅ **Dockerized**: Single compose file orchestrates all services

## References

- [Brief Documentation](docs/briefs/000-current/ping-service-brief.md)
- [Implementation Notes](docs/notes/2025-10-26/ping-service-implementation.md)
- [Tech Stack](docs/brainstorm/2025-10-25/server-tech-stack.md)
