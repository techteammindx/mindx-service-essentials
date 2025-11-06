import { join } from 'path';

import { Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { PING_COUNTER_GRPC_PACKAGE_NAME } from '@contract/infra/ping-counter.grpc.infra.contract';

export async function setupGrpcServerApp(InputModule: Type<any>) {
  const app = await NestFactory.createMicroservice<MicroserviceOptions> (
    InputModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:7777',
        package: [PING_COUNTER_GRPC_PACKAGE_NAME],
        protoPath: [
          join(__dirname, './proto/ping-counter.proto'),
        ],
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
        },
      },
    },
  );
  return app;
}

