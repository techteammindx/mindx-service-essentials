import { PingStats } from './ping-stats';
import { TimeInSecond } from './time-in-second';
import { RangeInSecond } from './range-in-second';
import { PingStatsRepository } from './ping-stats.repository';

export class PingStatsService {
  constructor(
    private readonly repository: PingStatsRepository,
  ) {}

  public async save(seconds: TimeInSecond, value: number): Promise<PingStats> {
    let stats = await this.repository.findOneBySeconds(seconds);
    if (!stats) {
      const newId = await this.repository.getNewId();
      stats = new PingStats(
        newId,
        seconds,
        value,
      );
    } else {
      stats.value = value;
    }

    const newStats = await this.repository.save(stats);
    return newStats;
  }

  public async query(range: RangeInSecond): Promise<PingStats[]> {
    const results = await this.repository.findInRange(range);
    return results;
  }
}

