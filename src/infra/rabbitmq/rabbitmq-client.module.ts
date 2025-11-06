import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RABBITMQ_CLIENT_MODULE_NAME } from './constants';

@Module({
  imports: [
    ClientsModule.registerAsync([{
      name: RABBITMQ_CLIENT_MODULE_NAME,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('RABBITMQ_URL') || ''],
          queue: configService.get<string>('RABBITMQ_QUEUE_NAME') || '',
          queueOptions: {
            durable: true,
          },
        },
      }),
    }]),
  ],
})
export class RabbitMQClientModule {}

