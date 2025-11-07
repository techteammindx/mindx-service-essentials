import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { config } from '@config/value';

import { KafkaInfraDIToken } from '@contract/infra/kafka.infra.contract';

@Global()
@Module({
  imports: [
    ClientsModule.register([{
      name: KafkaInfraDIToken.ClientModule,
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'mindx-service-essentials',
          brokers: config.kafka.brokers,
        },
        consumer: {
          groupId: 'mindx-service-essentials'
        }
      }
    }]),
  ],
  exports: [ClientsModule]
})
export class KafkaClientModule {}

