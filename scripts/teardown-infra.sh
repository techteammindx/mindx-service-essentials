#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.yaml"
ENV_FILE="$PROJECT_ROOT/.env.compose"

echo "Tearing down infrastructure stack..."
echo ""

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Error: Compose file not found at $COMPOSE_FILE"
  exit 1
fi

echo "Stopping containers..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans -v 2>/dev/null || true
echo "✓ Containers stopped and removed"

echo "Pruning volumes..."
docker volume prune -f &>/dev/null || true
echo "✓ Volumes pruned"

echo ""
echo "======================================="
echo "Infrastructure Cleanup Complete"
echo "======================================="
echo "All data is ephemeral and has been removed."
echo ""
echo "To restart the infrastructure, run:"
echo "  ./scripts/bootstrap-infra.sh"
