import { Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export const setupRabbitMQServerApp = async (InputModule: Type<any>) => {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(InputModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'mindx_service_essentials',
      queueOptions: {
        durable: true,
      },
    },
  });
  return app;
}
