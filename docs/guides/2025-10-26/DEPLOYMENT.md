# Ping Service Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 1.29+
- 4GB RAM minimum for all services

## Quick Start (Docker Compose)

### 1. Build and Start All Services

```bash
cd /path/to/mindx-service-essentials

# Build the service image and start all containers
docker compose up --build

# Expected output:
# mindx_service_essentials_mongo ✓
# mindx_service_essentials_zookeeper ✓
# mindx_service_essentials_kafka ✓
# mindx_service_essentials_postgres ✓
# mindx_service_essentials_app ✓ (GraphQL on 3000, gRPC on 5000)
```

### 2. Verify GraphQL Endpoint

```bash
# In another terminal
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ getAllPingCounters { id count } }"}'
```

Expected response:
```json
{
  "data": {
    "getAllPingCounters": []
  }
}
```

### 3. Test Increment Mutation

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { incrementPingCounter(input: { id: \"test-1\" }) { id count lastPingedAt } }"
  }'
```

Expected response:
```json
{
  "data": {
    "incrementPingCounter": {
      "id": "test-1",
      "count": 1,
      "lastPingedAt": "2025-10-26T..."
    }
  }
}
```

## Environment Configuration

Edit `.env.compose` to toggle behavior:

### Persistence Driver

```bash
# Use MongoDB (default)
PERSISTENCE_DRIVER=mongo

# Use PostgreSQL
PERSISTENCE_DRIVER=postgres
```

Restart service after change:
```bash
docker compose down mindx-service && docker compose up mindx-service
```

### Transport Mode

```bash
# GraphQL (default, port 3000)
TRANSPORT_MODE=graphql

# gRPC (port 5000)
TRANSPORT_MODE=grpc
```

Note: Requires container rebuild for now.

## Troubleshooting

### Service fails to start

Check logs:
```bash
docker compose logs mindx-service

# Expected startup sequence:
# 1. Connects to MongoDB/PostgreSQL
# 2. Initializes TypeORM schema
# 3. Starts Kafka producer
# 4. Registers Kafka consumer
# 5. Listens on port 3000 (GraphQL) or 5000 (gRPC)
```

### Kafka connection timeout

Verify Kafka is healthy:
```bash
docker compose logs kafka

# Kafka should output broker configuration and listeners
```

Check broker connectivity:
```bash
docker exec mindx_service_essentials_kafka \
  kafka-broker-api-versions \
  --bootstrap-server localhost:9092
```

### Database connection issues

**MongoDB:**
```bash
docker exec mindx_service_essentials_mongo \
  mongosh -u root -p root --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"

# Expected: { ok: 1 }
```

**PostgreSQL:**
```bash
docker exec mindx_service_essentials_postgres \
  psql -U postgres -d mindx_service_essentials \
  -c "SELECT 1"

# Expected: 1 row returned
```

## Persistence Verification

### With MongoDB

```bash
docker exec mindx_service_essentials_mongo \
  mongosh -u root -p root --authenticationDatabase admin \
  mindx_service_essentials \
  -c "db.ping_counters.find()"
```

### With PostgreSQL

```bash
docker exec mindx_service_essentials_postgres \
  psql -U postgres -d mindx_service_essentials \
  -c "SELECT * FROM ping_counters;"
```

## Kafka Event Verification

Monitor Kafka topic:
```bash
docker exec mindx_service_essentials_kafka \
  kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic mindx.ping.incremented.v1 \
  --from-beginning
```

You'll see JSON events like:
```json
{"id":"test-1","countBefore":0,"countAfter":1,"timestamp":"2025-10-26T..."}
```

## Performance Testing

### Load test with multiple increments

```bash
for i in {1..100}; do
  curl -X POST http://localhost:3000/graphql \
    -H "Content-Type: application/json" \
    -d '{"query": "mutation { incrementPingCounter(input: { id: \"load-test-1\" }) { count } }" }' \
    &
done

# Tail logs to see event processing
docker compose logs -f mindx-service | grep "PingService\|PingEventConsumer"
```

## Cleanup

```bash
# Stop all containers
docker compose down

# Remove volumes (resets databases)
docker compose down -v

# Remove image
docker image rm mindx-service-essentials:latest
```

## Development Workflow

### Local Development (Without Docker)

```bash
# Install dependencies
pnpm install

# Start only infrastructure services
docker compose up mongo postgres kafka zookeeper -d

# Run development server with hot-reload
pnpm start:dev

# Watch tests
pnpm test:watch
```

### Building for Production

```bash
# Build image
docker build -f docker/Dockerfile -t mindx-service-essentials:1.0.0 .

# Run with production settings
docker run -e NODE_ENV=production \
  -e PERSISTENCE_DRIVER=postgres \
  -e TRANSPORT_MODE=graphql \
  -p 3000:3000 \
  mindx-service-essentials:1.0.0
```

## Architecture Validation

The deployment validates:

✅ **DDD Pattern**: Domain logic isolated, aggregates enforce invariants
✅ **Hexagonal Architecture**: Ports & adapters decouple business logic from infrastructure
✅ **Transport Parity**: GraphQL and gRPC return identical payloads
✅ **Persistence Flexibility**: Switch Mongo/Postgres without code changes
✅ **Event-Driven**: Kafka integration demonstrates async communication
✅ **Type Safety**: Full TypeScript coverage with strict null checks

## Next Steps

1. **API Documentation**: Explore GraphQL schema at `http://localhost:3000/graphql`
2. **Integration Tests**: Add Testcontainers for CI/CD pipelines
3. **Monitoring**: Implement Prometheus metrics and structured logging
4. **API Gateway**: Expose endpoints via Kong or similar for rate limiting
5. **Scaling**: Consider horizontally scaling consumers with consumer group management
