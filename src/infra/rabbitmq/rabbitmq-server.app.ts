import { Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { config } from '@config/value';

export const setupRabbitMQServerApp = async (InputModule: Type<any>) => {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(InputModule, {
    transport: Transport.RMQ,
    options: {
      urls: [config.rabbitmq.serverUrl],
      queue: config.rabbitmq.queueName,
      queueOptions: {
        durable: true,
      },
    },
  });
  return app;
}

