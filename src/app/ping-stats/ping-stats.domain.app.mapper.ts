import { PingStats } from '@domain/ping-stats/ping-stats';
import { TimeInSecond } from '@domain/ping-stats/time-in-second';
import { RangeInSecond } from '@domain/ping-stats/range-in-second';

import { PingStatsSaveCommand, PingStatsQuery, PingStatsQueryTimeFrame } from '@contract/app/ping-stats.app.contract';

export class PingStatsAppMapper {
  private static readonly timeDeltaInSecondsRegistries = {
    [PingStatsQueryTimeFrame.Last5Minute]: 5 * 60,
    [PingStatsQueryTimeFrame.LastHour]: 60 * 60,
  }

  constructor() {
    this.toDTO.bind(this);
  }

  public fromSaveCommand(saveCommand: PingStatsSaveCommand) {
    return {
      seconds: new TimeInSecond(saveCommand.seconds),
      value: saveCommand.value,
    } 
  }

  public fromQuery(query: PingStatsQuery) {
    const to = Math.floor(new Date().getTime() / 1000);
    const delta = PingStatsAppMapper.timeDeltaInSecondsRegistries[query.timeFrame];
    const from = to - delta;
    return new RangeInSecond(
      new TimeInSecond(from),
      new TimeInSecond(to),
    )
  }

  public toDTO(stats: PingStats) {
    return {
      id: stats.id,
      seconds: stats.seconds.value,
      value: stats.value,
    }
  }
}

