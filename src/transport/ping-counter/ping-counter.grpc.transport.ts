import { Controller, Inject } from '@nestjs/common';

import { PingCounterApp, PingCounterAppDIToken } from '@contract/app/ping-counter.app.contract';

import {
  PingCounterGrpcServiceController,
  PingCounterGrpcServiceControllerMethods,
  PingCounterGrpcPayload,
} from '@contract/infra/ping-counter.grpc.infra.contract';

@Controller()
@PingCounterGrpcServiceControllerMethods()
export class PingCounterGrpcTransport implements PingCounterGrpcServiceController {

  constructor(@Inject(PingCounterAppDIToken.Domain) private readonly app: PingCounterApp) { }
  
  async get(): Promise<PingCounterGrpcPayload> {
    const result = await this.app.get();
    return {
      id: result.id,
      count: result.count,
      lastPingedAt: result.lastPingedAt,
      createdAt: result.createdAt,
    };
  }
  
  async ping(): Promise<PingCounterGrpcPayload> {
    const result = await this.app.ping();
    return {
      id: result.id,
      count: result.count,
      lastPingedAt: result.lastPingedAt,
      createdAt: result.createdAt,
    };
  }
}

