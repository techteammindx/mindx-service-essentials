import { Module } from '@nestjs/common';

import { PingCounterAppInjectToken } from '@contract/app/ping-counter.app.contract';
import { PingCounterDataSourceInjectToken } from '@contract/data-source/ping-counter.data-source.contract';

import { PingCounterGrpcTransport } from '@transport/ping-counter/ping-counter.grpc.transport';

import { PingCounterDomainApp } from '@app/ping-counter/ping-counter.domain.app';

import { PingCounterMongoRepository } from '@data-source/ping-counter/ping-counter.mongo.repository';
import { PingCounterKafkaEventPublisher } from '@data-source/ping-counter/ping-counter.kafka.event-publisher';

@Module({
  controllers: [
    PingCounterGrpcTransport,
  ],
  providers: [
    {
      provide: PingCounterAppInjectToken.Domain,
      inject: [
        PingCounterDataSourceInjectToken.Repository,
        PingCounterDataSourceInjectToken.EventPublisher,
      ],
      useFactory: (repository: PingCounterMongoRepository, eventPublisher: PingCounterKafkaEventPublisher) => {
        return new PingCounterDomainApp(repository, eventPublisher);
      },
    },
    {
      provide: PingCounterDataSourceInjectToken.Repository,
      useClass: PingCounterMongoRepository,
    },
    {
      provide: PingCounterDataSourceInjectToken.EventPublisher,
      useClass: PingCounterKafkaEventPublisher
    }
  ]
})
export class PingCounterDomainContainerModule {}

