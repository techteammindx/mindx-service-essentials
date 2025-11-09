import { Inject, Controller } from '@nestjs/common';

import { PingCounterGrpcServiceController, PingCounterGrpcServiceControllerMethods } from '@contract/infra/ping-counter.grpc.infra.contract';

import { PingCounterApp, PingCounterAppInjectToken } from '@contract/app/ping-counter.app.contract';

@PingCounterGrpcServiceControllerMethods()
@Controller()
export class PingCounterGrpcTransport implements PingCounterGrpcServiceController {

  constructor(
    @Inject(PingCounterAppInjectToken.Domain) private readonly app: PingCounterApp,
  ) {}

  async get() {
    return await this.app.get(); 
  }

  async ping() {
    return await this.app.ping();
  }
}
