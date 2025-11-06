import { Module } from '@nestjs/common';

import { PingCounterAppDIToken } from '@contract/app/ping-counter.app.contract';
import { PingCounterDomainService, PingCounterDataSourceDIToken } from '@contract/data-source/ping-counter.data-source.contract';

import { PingCounterDomainApp } from '@app/ping-counter/ping-counter.domain.app';
import { PingCounterAPILayerApp } from '@app/ping-counter/ping-counter.api-layer.app';

import { PingCounterGraphQLTransport } from '@transport/ping-counter/ping-counter.graphql.transport';
import { PingCounterGrpcTransport } from '@transport/ping-counter/ping-counter.grpc.transport';

import { PingCounterMongoRepository } from '@data-source/ping-counter/repository/ping-counter.mongo.repository';

import { PingCounterKafkaEventPublisher } from '@data-source/ping-counter/event-publisher/ping-counter.kafka.event-publisher';

import { PingCounterGrpcDomainService } from '@data-source/ping-counter/domain-service/ping-counter.grpc.domain-service';

@Module({
  controllers: [
    PingCounterGrpcTransport,
  ],
  providers: [
    PingCounterGraphQLTransport,
    {
      provide: PingCounterDataSourceDIToken.Repository,
      useClass: PingCounterMongoRepository,
    },
    {
      provide: PingCounterDataSourceDIToken.EventPublisher,
      useClass: PingCounterKafkaEventPublisher,
    },
    {
      provide: PingCounterDataSourceDIToken.DomainService,
      useClass: PingCounterGrpcDomainService
    },
    {
      provide: PingCounterAppDIToken.APILayer,
      useFactory: (service: PingCounterDomainService) => (
        new PingCounterAPILayerApp(service)
      ),
      inject: [PingCounterDataSourceDIToken.DomainService]
    },
    {
      provide: PingCounterAppDIToken.Domain,
      useFactory: (
        repository: PingCounterMongoRepository,
        eventPublisher: PingCounterKafkaEventPublisher,
      ) => new PingCounterDomainApp(repository, eventPublisher),
      inject: [
        PingCounterDataSourceDIToken.Repository,
        PingCounterDataSourceDIToken.EventPublisher
      ]
    }
  ],
})
export class PingCounterContainerModule {}

