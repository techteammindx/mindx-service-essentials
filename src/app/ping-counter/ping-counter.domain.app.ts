import { PingCounterRepository } from '@domain/ping-counter/ping-counter.repository';
import { PingCounterEventPublisher } from '@domain/ping-counter/ping-counter.event-publisher';
import { PingCounterService } from '@domain/ping-counter/ping-counter.service';

import { PingCounterApp, PingCounterAppDTO } from '@contract/app/ping-counter.app.contract';

import { PingCounterDomainAppMapper } from './ping-counter.domain.app.mapper';

export class PingCounterDomainApp implements PingCounterApp {
  
  private service: PingCounterService;
  private mapper: PingCounterDomainAppMapper;

  constructor(
    repository: PingCounterRepository,
    eventPublisher: PingCounterEventPublisher,
  ) {
    this.service = new PingCounterService(repository, eventPublisher);
    this.mapper = new PingCounterDomainAppMapper();
  }

  async get(): Promise<PingCounterAppDTO> {
    const pingCounter = await this.service.get();
    return this.mapper.toDTO(pingCounter);
  }

  async ping(): Promise<PingCounterAppDTO> {
    const pingCounter= await this.service.increment();
    return this.mapper.toDTO(pingCounter);
  }
}

