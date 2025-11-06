import { Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export const setupKafkaServerApp = async (InputModule: Type<any>) => {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(InputModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'mindx_service_essentials',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'mindx_service_essentials',
        fromBeginning: true,
      }
    }
  });
  return app;
}
