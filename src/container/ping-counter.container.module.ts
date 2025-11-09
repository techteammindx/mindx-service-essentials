import { Module } from '@nestjs/common';

import { PingCounterAppInjectToken } from '@contract/app/ping-counter.app.contract';
import { PingCounterDataSourceInjectToken } from '@contract/data-source/ping-counter.data-source.contract';

import { PingCounterGraphQLResolverTransport } from '@transport/graphql/ping-counter.graphql.transport';

import { PingCounterAPILayerApp } from '@app/ping-counter/ping-counter.api-layer.app';

import { PingCounterGrpcDomainService }  from '@data-source/ping-counter/ping-counter.grpc.domain-service';

@Module({
  providers: [
    PingCounterGraphQLResolverTransport,
    {
      provide: PingCounterAppInjectToken.APILayer,
      useClass: PingCounterAPILayerApp,
    },
    {
      provide: PingCounterDataSourceInjectToken.DomainService,
      useClass: PingCounterGrpcDomainService,
    }
  ]
})
export class PingCounterContainerModule {};

