import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { config } from '@config/value';
import { DataSourceProtocol } from '@config/types';

import { MongoModule } from '@infra/mongo/mongo.module';
import { KafkaClientModule } from '@infra/kafka/kafka-client.module';
import { GrpcClientModule } from '@infra/grpc/grpc-client.module';

import { PingCounterContainerModule } from '@container/ping-counter.container.module';
import { PingStatsContainerModule } from '@container/ping-stats.container.module';

const dataSourceModules = [
  ...(config.dataSourceProtocols.includes(DataSourceProtocol.MONGO) ? [MongoModule] : []),
  ...(config.dataSourceProtocols.includes(DataSourceProtocol.KAFKA) ? [KafkaClientModule] : []),
  ...(config.dataSourceProtocols.includes(DataSourceProtocol.GRPC) ? [GrpcClientModule] : []),
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...dataSourceModules,
    PingCounterContainerModule,
    PingStatsContainerModule,
  ],
})
export class AppModule {}

