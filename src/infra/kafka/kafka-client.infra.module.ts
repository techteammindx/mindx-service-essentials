import { Module, Global} from '@nestjs/common';

import { ClientsModule, Transport } from '@nestjs/microservices';

import { KafkaInfraInjectToken } from '@contract/infra/kafka.infra.contract';

import { config } from '@config/value';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: KafkaInfraInjectToken.ClientModule,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'mindx_service_essentials',
            brokers: config.kafka.brokers,
          },
          consumer: {
            groupId: 'mindx_service_essentials'
          }
        }
      }
    ])
  ],
  exports: [ClientsModule]
})
export class KafkaClientInfraModule {}

