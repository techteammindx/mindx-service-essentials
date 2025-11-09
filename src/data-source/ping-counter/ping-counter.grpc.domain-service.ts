import { lastValueFrom } from 'rxjs';

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

import { PingCounterDomainService } from '@contract/data-source/ping-counter.data-source.contract';

import { PingCounterGrpcServiceClient, PING_COUNTER_GRPC_PACKAGE_NAME, PING_COUNTER_GRPC_SERVICE_NAME } from '@contract/infra/ping-counter.grpc.infra.contract';

@Injectable()
export class PingCounterGrpcDomainService implements PingCounterDomainService, OnModuleInit {

  private service: PingCounterGrpcServiceClient | undefined;

  constructor(
    @Inject(PING_COUNTER_GRPC_PACKAGE_NAME) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.service = this.client.getService<PingCounterGrpcServiceClient>(PING_COUNTER_GRPC_SERVICE_NAME);
  }

  async get() {
    if (!this.service) throw new Error('serivce not ready');
    const response = await lastValueFrom(
      this.service.get({})
    );
    return response;
  }

  async ping() {
    if (!this.service) throw new Error('service not ready');
    const response = await lastValueFrom(
      this.service.ping({})
    );
    return response;
  }

}
