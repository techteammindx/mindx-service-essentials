import { join } from 'path';

import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { config } from '@config/value';

import { PING_COUNTER_GRPC_PACKAGE_NAME } from '@contract/infra/ping-counter.grpc.infra.contract'; 

@Global()
@Module({
  imports: [
    ClientsModule.register([{
      name: PING_COUNTER_GRPC_PACKAGE_NAME,
      transport: Transport.GRPC,
      options: {
        package: PING_COUNTER_GRPC_PACKAGE_NAME,
        url: config.grpc.serviceUrl || '',
        protoPath: join(__dirname, 'proto/ping-counter.proto'),
      },
    }]),
  ],
  exports: [
    ClientsModule,
  ]
})
export class GrpcClientModule {};

