#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.yaml"
ENV_FILE="$PROJECT_ROOT/.env.compose"

DETACHED=false
TIMEOUT=120
CHECK_INTERVAL=5

while [[ $# -gt 0 ]]; do
  case $1 in
    --detached)
      DETACHED=true
      shift
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--detached] [--timeout SECONDS]"
      exit 1
      ;;
  esac
done

echo "Starting infrastructure stack..."
echo "Compose file: $COMPOSE_FILE"
echo ""

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "Warning: $ENV_FILE not found, using defaults"
fi

if [ "$DETACHED" = true ]; then
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
  echo "Stack started in detached mode"
  exit 0
else
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up &
  COMPOSE_PID=$!
fi

echo "Waiting for services to be healthy (timeout: ${TIMEOUT}s)..."

elapsed=0
while [ $elapsed -lt $TIMEOUT ]; do
  HEALTHY_SERVICES=0
  TOTAL_SERVICES=3

  if docker exec mindx_service_essentials_mongo mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "✓ MongoDB is ready"
    ((HEALTHY_SERVICES++))
  else
    echo "⏳ Waiting for MongoDB..."
  fi

  if docker exec mindx_service_essentials_zookeeper nc -z localhost 2181 &>/dev/null; then
    echo "✓ Zookeeper is ready"
    ((HEALTHY_SERVICES++))
  else
    echo "⏳ Waiting for Zookeeper..."
  fi

  if docker exec mindx_service_essentials_kafka kafka-topics --bootstrap-server localhost:9092 --list &>/dev/null; then
    echo "✓ Kafka is ready"
    ((HEALTHY_SERVICES++))
  else
    echo "⏳ Waiting for Kafka..."
  fi

  if [ $HEALTHY_SERVICES -eq $TOTAL_SERVICES ]; then
    echo ""
    echo "Infrastructure stack is ready!"
    echo ""
    echo "Services available at:"
    echo "  - MongoDB: localhost:27017 (root/root)"
    echo "  - Kafka: localhost:9092"
    echo "  - Zookeeper: localhost:2181"
    echo ""
    echo "Connection strings:"
    echo "  - Mongo URI: mongodb://root:root@localhost:27017/crm?authSource=admin"
    echo "  - Kafka Brokers: localhost:9092"

    if [ "$DETACHED" = false ]; then
      wait $COMPOSE_PID
    fi
    exit 0
  fi

  sleep $CHECK_INTERVAL
  elapsed=$((elapsed + CHECK_INTERVAL))
done

echo ""
echo "ERROR: Infrastructure services did not become healthy within ${TIMEOUT}s"
echo ""
echo "Current container status:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "Recent logs:"
docker compose -f "$COMPOSE_FILE" logs --tail=50

if [ "$DETACHED" = false ] && [ ! -z "$COMPOSE_PID" ]; then
  kill $COMPOSE_PID 2>/dev/null || true
fi

exit 1
