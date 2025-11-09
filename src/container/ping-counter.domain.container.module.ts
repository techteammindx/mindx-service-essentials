import { Module } from '@nestjs/common';

import { PingCounterAppInjectToken } from '@contract/app/ping-counter.app.contract';

import { PingCounterGrpcTransport } from '@transport/ping-counter/ping-counter.grpc.transport';

import { PingCounterDomainApp } from '@app/ping-counter/ping-counter.domain.app';

@Module({
  controllers: [
    PingCounterGrpcTransport,
  ],
  providers: [
    {
      provide: PingCounterAppInjectToken.Domain,
      useClass: PingCounterDomainApp,
    }
  ]
})
export class PingCounterDomainContainerModule {}

