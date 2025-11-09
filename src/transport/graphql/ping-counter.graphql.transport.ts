import { Inject } from '@nestjs/common';

import { Resolver, Query, Mutation } from '@nestjs/graphql';

import { PingCounterAppInjectToken, PingCounterApp } from '@contract/app/ping-counter.app.contract';

import { PingCounterGraphQLDTO } from './ping-counter.graphql.schema.transport';

@Resolver()
export class PingCounterGraphQLResolverTransport {

  constructor(
    @Inject(PingCounterAppInjectToken.APILayer) private readonly app: PingCounterApp,
  ) {}

  @Query(() => PingCounterGraphQLDTO)
  async get(): Promise<PingCounterGraphQLDTO> {
    return await this.app.get();
  }

  @Mutation(() => PingCounterGraphQLDTO)
  async ping(): Promise<PingCounterGraphQLDTO> {
    return await this.app.ping();
  }
}
