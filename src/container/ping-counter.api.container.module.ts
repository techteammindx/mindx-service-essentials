import { Module } from '@nestjs/common';

import { PingCounterAppInjectToken } from '@contract/app/ping-counter.app.contract';
import { PingCounterDataSourceInjectToken } from '@contract/data-source/ping-counter.data-source.contract';

import { PingCounterGraphQLResolverTransport } from '@transport/ping-counter/ping-counter.graphql.transport';

import { PingCounterAPIApp } from '@app/ping-counter/ping-counter.api.app';

import { PingCounterGrpcDomainService }  from '@data-source/ping-counter/ping-counter.grpc.domain-service';

@Module({
  providers: [
    PingCounterGraphQLResolverTransport,
    {
      provide: PingCounterAppInjectToken.API,
      useClass: PingCounterAPIApp,
    },
    {
      provide: PingCounterDataSourceInjectToken.DomainService,
      useClass: PingCounterGrpcDomainService,
    }
  ]
})
export class PingCounterAPIContainerModule {};

