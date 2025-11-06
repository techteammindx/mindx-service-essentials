import { PingCounterApp } from '@contract/app/ping-counter.app.contract';
import { PingCounterDomainService } from '@contract/data-source/ping-counter.data-source.contract';

export class PingCounterAPILayerApp implements PingCounterApp {
  constructor(
    private readonly service: PingCounterDomainService,
  ) {}

  async get() {
    return this.service.get();
  }

  async ping() {
    return this.service.ping();
  }
}

