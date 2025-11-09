import { Inject, Injectable } from '@nestjs/common';

import { PingCounterApp, PingCounterAppDTO } from '@contract/app/ping-counter.app.contract';
import { PingCounterDomainService, PingCounterDataSourceInjectToken } from '@contract/data-source/ping-counter.data-source.contract';

@Injectable()
export class PingCounterAPIApp implements PingCounterApp {
  
  constructor(
    @Inject(PingCounterDataSourceInjectToken.DomainService) private readonly service: PingCounterDomainService,
  ) {}

  async get(): Promise<PingCounterAppDTO> {
    return await this.service.get();
  }

  async ping(): Promise<PingCounterAppDTO> {
    return await this.service.ping();
  }

}
