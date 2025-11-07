import { PingStatsService } from '@domain/ping-stats/ping-stats.service';
import { PingStatsRepository } from '@domain/ping-stats/ping-stats.repository';

import { PingStatsApp, PingStatsSaveCommand, PingStatsQuery } from '@contract/app/ping-stats.app.contract';

import { PingStatsAppMapper } from './ping-stats.domain.app.mapper';

export class PingStatsDomainApp implements PingStatsApp {
  
  private readonly service: PingStatsService;

  constructor(
    repository: PingStatsRepository,
    private readonly mapper: PingStatsAppMapper = new PingStatsAppMapper(),
  ) {
    this.service = new PingStatsService(repository);
  }

  async save(saveCommand: PingStatsSaveCommand) {
    const {
      seconds,
      value,
    } = this.mapper.fromSaveCommand(saveCommand);
    const newPingStats = await this.service.save(seconds, value);
    return this.mapper.toDTO(newPingStats);
  }

  async query(query: PingStatsQuery) {
    const range = this.mapper.fromQuery(query);
    const results = await this.service.query(range);
    return results.map((result) => this.mapper.toDTO(result));
  }
}

