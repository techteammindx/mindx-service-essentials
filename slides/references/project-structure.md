# Project Structure

## src/ Directory Tree

```
src/
|-- app/                               # Application layer (use cases, orchestration)
|   +-- ping-counter/
|       |-- ping-counter.api.app.ts              # API-facing application service
|       +-- ping-counter.domain.app.ts           # Domain-facing application service
|
|-- config/                            # Configuration management
|   |-- value.ts                       # Runtime configuration values (env-based)
|   +-- type.ts                        # Configuration type definitions
|
|-- container/                         # Dependency injection (Nest modules)
|   |-- ping-counter.api.container.module.ts    # API slice DI bindings
|   +-- ping-counter.domain.container.module.ts # Domain slice DI bindings
|
|-- contract/                          # Shared interfaces & contracts
|   |-- app/
|   |   +-- ping-counter.app.contract.ts        # Application layer contracts
|   |-- data-source/
|   |   +-- ping-counter.data-source.contract.ts # Data source layer contracts
|   +-- infra/
|       |-- mongo.infra.contract.ts             # MongoDB contracts
|       |-- ping-counter.grpc.infra.contract.ts # gRPC service contracts
|       |-- kafka.infra.contract.ts             # Kafka event contracts
|       +-- rabbitmq.infra.contract.ts          # RabbitMQ event contracts
|
|-- data-source/                       # Infrastructure adapters (repositories, publishers)
|   +-- ping-counter/
|       |-- ping-counter.mongo.repository.ts    # MongoDB persistence adapter
|       |-- ping-counter.kafka.event-publisher.ts # Kafka event publisher
|       +-- ping-counter.grpc.domain-service.ts # gRPC client adapter
|
|-- domain/                            # Domain layer (core business logic, aggregates)
|   +-- ping-counter/
|       |-- ping-counter.ts                     # Aggregate root
|       |-- ping-counter.service.ts             # Domain service
|       |-- ping-counter.repository.ts          # Repository interface
|       |-- ping-counter.event-publisher.ts     # Event publisher interface
|       |-- ping-counter.event.ts               # Domain event base
|       +-- ping-counter.incremented.event.ts   # Specific domain event
|
|-- infra/                             # Infrastructure bootstrappers (frameworks, clients)
|   |-- graphql/
|   |   +-- graphql-server.app.ts      # GraphQL server setup
|   |-- grpc/
|   |   |-- grpc-server.app.ts         # gRPC server setup
|   |   |-- grpc-client.infra.module.ts # gRPC client DI module
|   |   +-- proto/
|   |       +-- ping-counter.proto     # gRPC protocol definitions
|   |-- kafka/
|   |   +-- kafka-client.infra.module.ts # Kafka client DI module
|   +-- mongo/
|       |-- mongo.infra.module.ts      # MongoDB DI module
|       +-- schema/
|           +-- ping-counter.schema.ts # MongoDB document schema
|
|-- transport/                         # Interface adapters (HTTP, gRPC, async consumers)
|   +-- ping-counter/
|       |-- ping-counter.graphql.transport.ts        # GraphQL resolver
|       |-- ping-counter.graphql.schema.transport.ts # GraphQL schema types
|       +-- ping-counter.grpc.transport.ts           # gRPC controller
|
|-- app.module.ts                      # Main Nest application module
+-- main.ts                            # Application bootstrap entry point
```

## Layer Responsibilities

### Domain Layer (`src/domain/`)
- Pure business logic, aggregates, and entities
- No framework dependencies
- Defines contracts (interfaces) for repositories and event publishers

### Application Layer (`src/app/`)
- Use case orchestration
- Thin orchestration between domain and data sources
- Implements contracts from the domain layer

### Data Source Layer (`src/data-source/`)
- Concrete implementations of domain contracts
- Adapters for databases (MongoDB), message brokers (Kafka, RabbitMQ), and external services (gRPC)

### Transport Layer (`src/transport/`)
- Interface adapters (GraphQL resolvers, gRPC controllers, async message consumers)
- Maps DTOs to/from domain objects
- Handles HTTP/gRPC/async protocol details

### Infrastructure Layer (`src/infra/`)
- Framework bootstrappers (GraphQL/gRPC servers, MongoDB/Kafka clients)
- DI module configurations
- Protocol specifications (proto files)

### Config Layer (`src/config/`)
- Centralized environment-based configuration
- Runtime values and type definitions

### Contract Layer (`src/contract/`)
- Shared interfaces and constants across layers
- Kafka/RabbitMQ topic patterns and message payloads
- gRPC service definitions
