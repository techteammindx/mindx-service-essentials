import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { config } from '@config/value';
import { DataSourceDriver } from '@config/types';

import { MongoModule } from '@infra/mongo/mongo.module';
import { KafkaClientModule } from '@infra/kafka/kafka-client.module';
import { GrpcClientModule } from '@infra/grpc/grpc-client.module';

import { PingCounterContainerModule } from '@container/ping-counter.container.module';
import { PingStatsContainerModule } from '@container/ping-stats.container.module';

const dataSourceModules = [
  ...(config.dataSourceDrivers.includes(DataSourceDriver.MONGO) ? [MongoModule] : []),
  ...(config.dataSourceDrivers.includes(DataSourceDriver.KAFKA) ? [KafkaClientModule] : []),
  ...(config.dataSourceDrivers.includes(DataSourceDriver.GRPC) ? [GrpcClientModule] : []),
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

