import { Module } from '@nestjs/common';

import { PingCounterAPIContainerModule } from '@container/ping-counter.api.container.module';
import { PingCounterDomainContainerModule } from '@container/ping-counter.domain.container.module';

import { GrpcClientInfraModule } from '@infra/grpc/grpc-client.infra.module';
import { MongoInfraModule } from '@infra/mongo/mongo.infra.module';
import { KafkaClientInfraModule } from '@infra/kafka/kafka-client.infra.module';

@Module({
  imports: [
    GrpcClientInfraModule,
    MongoInfraModule,
    KafkaClientInfraModule,
    PingCounterAPIContainerModule,
    PingCounterDomainContainerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

