# RabbitMQ Compose Integration

## Summary
- Added a dedicated `rabbitmq` service with management UI to the shared Docker Compose stack.
- Introduced RabbitMQ defaults in `.env.compose` and wired them into the app container configuration.
- Extended `scripts/bootstrap-infra.sh` health checks and connection summaries to cover the new broker.

## Validation
- `scripts/bootstrap-infra.sh --detached --timeout 120`
- `docker compose -f docker/docker-compose.yaml --env-file .env.compose down`

## Next Steps
- Decide when exercises should flip `ASYNC_TRANSPORT_PROTOCOL` to `RABBITMQ` so learners can exercise the queue path.
