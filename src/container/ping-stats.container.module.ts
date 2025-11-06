import { Module } from '@nestjs/common';

import { PingStatsDataSourceDIToken } from '@contract/data-source/ping-stats.data-source.contract';
import { PingStatsAppDIToken } from '@contract/app/ping-stats.app.contract';

import { PingStatsKafkaTransport } from '@transport/ping-stats/ping-stats.kafka.transport';
import { PingStatsGraphQLTransport } from '@transport/ping-stats/ping-stats.graphql.transport';

import { PingStatsDomainApp } from '@app/ping-stats/ping-stats.domain.app';

import { PingStatsMongoRepository } from '@data-source/ping-stats/repository/ping-stats.mongo.repository';

@Module({
  controllers: [
    PingStatsKafkaTransport,
  ],
  providers: [
    PingStatsGraphQLTransport,
    {
      provide: PingStatsDataSourceDIToken.Repository,
      useClass: PingStatsMongoRepository,
    },
    {
      provide: PingStatsAppDIToken.Domain,
      inject: [PingStatsDataSourceDIToken.Repository],
      useFactory: (repository: PingStatsMongoRepository) => (
        new PingStatsDomainApp(repository)
      )
    }
  ]
})
export class PingStatsContainerModule {}

