import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { config } from '@config/value';

import { RabbitMQInfraDIToken } from '@contract/infra/rabbitmq.infra.contract';

@Module({
  imports: [
    ClientsModule.register([{
      name: RabbitMQInfraDIToken.ClientModule,
      transport: Transport.RMQ,
      options: {
        urls: [config.rabbitmq.serverUrl],
        queue: config.rabbitmq.queueName,
        queueOptions: {
          durable: true,
        },
      },
    }]),
  ],
})
export class RabbitMQClientModule {}

