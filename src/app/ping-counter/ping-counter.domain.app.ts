import { PingCounterApp } from '@contract/app/ping-counter.app.contract';

import { PingCounterService } from '@domain/ping-counter/ping-counter.service';
import { PingCounterRepository } from '@domain/ping-counter/ping-counter.repository';
import { PingCounterEventPublisher } from '@domain/ping-counter/ping-counter.event-publisher';

export class PingCounterDomainApp implements PingCounterApp {

  private readonly service: PingCounterService;

  constructor(
    repository: PingCounterRepository,
    eventPublisher: PingCounterEventPublisher,
  ) {
    this.service = new PingCounterService(
      repository,
      eventPublisher,
    );
  }

  async get() {
    return await this.service.get();
  }
  
  async ping() {
    return await this.service.ping();
  }
}
