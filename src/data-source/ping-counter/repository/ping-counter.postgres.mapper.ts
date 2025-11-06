import { PingCounter } from '@domain/ping-counter/ping-counter';
import { PingCounterPostgresEntity } from '@infra/postgres/entities/ping-counter.postgres.entity';

export class PingCounterPostgresMapper {
  public toAggregate(entity: PingCounterPostgresEntity): PingCounter {
    return new PingCounter(
      entity.id,
      entity.count,
      entity.lastPingedAt,
      entity.createdAt,
    );
  }

  public fromAggregate(aggregate: PingCounter): PingCounterPostgresEntity {
    const entity = new PingCounterPostgresEntity();
    entity.id = aggregate.id;
    entity.count = aggregate.count;
    entity.lastPingedAt = aggregate.lastPingedAt;
    entity.createdAt = aggregate.createdAt;
    return entity;
  }
}
