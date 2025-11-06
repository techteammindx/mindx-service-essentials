import { PingCounter } from '@domain/ping-counter/ping-counter';
import { PingCounterMongoDocument } from '@infra/mongo/schemas/ping-counter.mongo.schema';

export interface PingCounterMongoUpsertPayload {
  filter: object;
  update: object;
}

export class PingCounterMongoMapper {
  public toAggregate(entity: PingCounterMongoDocument): PingCounter {
    return new PingCounter(
      entity.id,
      entity.count,
      entity.lastPingedAt,
      entity.createdAt,
    );
  }

  public fromAggregateToUpserPayload(aggregate: PingCounter): PingCounterMongoUpsertPayload {
    const filter = {
      id: aggregate.id,
    };
    const update = {
      count: aggregate.count,
      lastPingedAt: aggregate.lastPingedAt,
      createdAt: aggregate.createdAt,
    };
    return {
      filter,
      update,
    };
  }
}

