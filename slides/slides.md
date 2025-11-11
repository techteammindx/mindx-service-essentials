---
theme: default
title: Service Essentials Workshop
info: |
  ## Slides for Service Essentials Training
favicon: images/favicon.svg
mdc: true
---

# Service Essentials Workshop
MindX Engineering

---

# Agenda

1. Ground rules
2. Pre-work
3. Target app overview
4. Hexagon architecture overview
5. DDD (Domain Driven Design)

---

# Ground rules

1. Participants do code, not just watch
2. No direct AI-generated codes, every changes made by human 
3. AI can be used to investigate bugs or issues, Q&A, brainstorm, generate samples code 
3. No process enforced or production codes expected

---

# Pre-work

1. Clone the repo and checkout to the zero version

```
git clone git@github.com:techteammindx/mindx-service-essentials.git
git checkout v0.0.0

```

2. Prepare NodeJS 22.x

```
# Install volta
curl https://get.volta.sh | bash

# Switch to Node 22.x
volta install node@22

# Install pnpm
volta install pnpm
```

3. Get infrastructure dependencies to work

```
docker compose up -d
```

4. Getting started with NestJS

```
npm i -g nestjs/cli
nest new . --package-manager pnpm
```
---

# Target app overview

<div class="flex items-center justify-center h-full">

![Target app overview](./images/app-overview.svg)

</div>

---
layout: image-left

image: images/hexagon-overview.svg

backgroundSize: contain

---

## Hexagon Architecture Overview

- **Infrastructure (Infra)**: Frameworks and Tools
  - Ins: REST API, GraphQL, GRPC Calls, Kafka Consumers ...
  - Outs: MongoDB, PostgresDB, GRPC Services, Kafka Producers ...

- **Application (App)**: Business Logic

- **Transport and Data Source**: Isolation layers between App and Infra
  - **Transport**:  Isolation of the incoming Transport protocol (Infra Ins)
  - **Data source**: Isolation of Data persistence or Event publishing (Infra Outs)

---
layout: image-left

image: images/task-1.svg

backgroundSize: contain
---

## Task 1

Acceptance Criteria:
1. `get()` query and `ping()` mutation via *GraphQL*
2. Requests are forwarded via *gRPC* Domain Service

---

## Task 1: Sample project structure

<style scoped>
pre code {
  font-size: 0.7em; /* Adjust this value as needed (e.g., 70%, 14px, etc.) */
}
</style>

```
|-- app/                                          # Application layer (use cases, orchestration)
|   +-- ping-counter/
|       |-- ping-counter.api.app.ts               # API Layer application service
|-- container/                                    # NestJS Composition Modules
|   |-- ping-counter.api.container.module.ts      # PingCounter API Layer DI bindings
|-- contract/                                     # NestJS Dependency Injection Contracts
|   |-- app/
|   |   +-- ping-counter.app.contract.ts          # Application layer contracts
|   |-- data-source/
|   |   +-- ping-counter.data-source.contract.ts  # Data source layer contracts
|   +-- infra/
|       |-- ping-counter.grpc.infra.contract.ts   # gRPC service contracts
|-- data-source/                                  # Infrastructure output adapters (repositories, publishers, domain services)
|   +-- ping-counter/
|       +-- ping-counter.grpc.domain-service.ts   # gRPC domain service
|-- infra/                                        # Infrastructure (frameworks, clients)
|   |-- graphql/
|   |   +-- graphql-server.app.ts                 # GraphQL server 
|   |-- grpc/
|       |-- grpc-client.infra.module.ts           # gRPC client module
|       +-- proto/
|           +-- ping-counter.proto                # gRPC protocol definitions
|-- transport/                                    # Interface adapters (HTTP, gRPC, async consumers)
|   +-- ping-counter/
|       |-- ping-counter.graphql.transport.ts        # GraphQL resolver
|       |-- ping-counter.graphql.schema.transport.ts # GraphQL schema types
```

---
layout: image-left

image: images/hexagon-with-ddd.svg

backgroundSize: contain

---

## DDD Architecture Overview

- **Goal**: Centralization of business rules
- **Approach**:
  1. Tie data and business rules together in domain objects, AND
  2. Use them as the smallest units of domain transactions

---
layout: image-left

image: images/task-2.svg

backgroundSize: contain
---

## Task 2

Acceptance Criteria:
1. `get()` and `ping()` methods via *gRPC*
2. Data persistence into *MongoDB*
3. Event publishing via *Kafka*

---

## Task 2: Sample project structure (1)

<style scoped>
pre code {
  font-size: 0.7em; /* Adjust this value as needed (e.g., 70%, 14px, etc.) */
}
</style>

```
|-- app/                               # Application layer (use cases, orchestration)
|   +-- ping-counter/
|       +-- ping-counter.domain.app.ts           # Domain-facing application service
|-- config/                            # Configuration management
|   |-- value.ts                       # Runtime configuration values (env-based)
|   +-- type.ts                        # Configuration type definitions
|-- container/                         # Dependency injection (Nest modules)
|   +-- ping-counter.domain.container.module.ts # Domain slice DI bindings
|-- contract/                          # Shared interfaces & contracts
|   |-- app/
|   |   +-- ping-counter.app.contract.ts        # Application layer contracts
|   |-- data-source/
|   |   +-- ping-counter.data-source.contract.ts # Data source layer contracts
|   +-- infra/
|       |-- mongo.infra.contract.ts             # MongoDB contracts
|       |-- kafka.infra.contract.ts             # Kafka event contracts
|-- data-source/                       # Infrastructure adapters (repositories, publishers)
|   +-- ping-counter/
|       |-- ping-counter.mongo.repository.ts    # MongoDB persistence adapter
|       |-- ping-counter.kafka.event-publisher.ts # Kafka event publisher
```

---

## Task 2: Sample project structure (2)

<style scoped>
pre code {
  font-size: 0.7em; /* Adjust this value as needed (e.g., 70%, 14px, etc.) */
}
</style>

```
|-- domain/                            # Domain layer (core business logic, aggregates)
|   +-- ping-counter/
|       |-- ping-counter.ts                     # Aggregate root
|       |-- ping-counter.service.ts             # Domain service
|       |-- ping-counter.repository.ts          # Repository interface
|       |-- ping-counter.event-publisher.ts     # Event publisher interface
|       |-- ping-counter.event.ts               # Domain event base
|       +-- ping-counter.incremented.event.ts   # Specific domain event
|-- infra/                             # Infrastructure bootstrappers (frameworks, clients)
|   |-- grpc/
|   |   |-- grpc-server.app.ts         # gRPC server setup
|   |   +-- proto/
|   |       +-- ping-counter.proto     # gRPC protocol definitions
|   |-- kafka/
|   |   +-- kafka-client.infra.module.ts # Kafka client DI module
|   +-- mongo/
|       |-- mongo.infra.module.ts      # MongoDB DI module
|       +-- schema/
|           +-- ping-counter.schema.ts # MongoDB document schema
|-- transport/                         # Interface adapters (HTTP, gRPC, async consumers)
|   +-- ping-counter/
|       |-- ping-counter.graphql.transport.ts        # GraphQL resolver
|       |-- ping-counter.graphql.schema.transport.ts # GraphQL schema types
|       +-- ping-counter.grpc.transport.ts           # gRPC controller
```

---
layout: image-left

image: images/task-3.svg

backgroundSize: contain
---

## Task 3

Acceptance Criteria:
1. `incremented` event consumed from Kafka
2. PingCounter `value` recorded by *seconds* 
3. `value` series queried by time frame: *Last5Minute*, *Last1Hour* 

---

## Bonus tasks

1. Dealing with racing conditions in `ping` functions / methods
2. Change infra combination to `REST` + `Postgres` + `RabbitMQ`
3. Deploy all to `docker` or `K8s`

