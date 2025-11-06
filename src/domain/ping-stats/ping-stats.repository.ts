import { PingStats } from './ping-stats';
import { TimeInSecond } from './time-in-second';
import { RangeInSecond } from './range-in-second';

export interface PingStatsRepository {
  getNewId(): Promise<string>;
  save(stats: PingStats): Promise<PingStats>;
  findOneBySeconds(seconds: TimeInSecond): Promise<PingStats | null>;
  findInRange(range: RangeInSecond): Promise<PingStats[]>;
}

