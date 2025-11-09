import { join } from 'path';

import { NestFactory } from '@nestjs/core';
import { Type } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { PING_COUNTER_GRPC_PACKAGE_NAME } from '@contract/infra/ping-counter.grpc.infra.contract';

export const setupGrpcServerApp = async (InputModule: Type<any>) => {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(InputModule, {
    transport: Transport.GRPC,
    options: {
      package: PING_COUNTER_GRPC_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto/ping-counter.proto'),
    }
  });

  return app;
}
