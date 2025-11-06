import { PingStats } from '@domain/ping-stats/ping-stats';
import { TimeInSecond } from '@domain/ping-stats/time-in-second';

import { PingStatsMongoDocument } from '@infra/mongo/schemas/ping-stats.mongo.schema';

export class PingStatsMongoMapper {
  fromAggregateToUpsertPayload(stats: PingStats) {
    const filter = {
      id: stats.id,
    };
    const update = {
      seconds: stats.seconds.value,
      value: stats.value,
    };
    return {
      filter,
      update,
    };
  }

  toAggregate(document: PingStatsMongoDocument) {
    return new PingStats(
      document.id,
      new TimeInSecond(document.seconds),
      document.value,
    );
  }
}

