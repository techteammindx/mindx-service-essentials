import { Inject } from '@nestjs/common';

import { Resolver, Query, Mutation } from '@nestjs/graphql';

import { PingCounterApp, PingCounterAppDIToken } from '@contract/app/ping-counter.app.contract';

import { PingCounterGraphQL } from './ping-counter.graphql.types';

@Resolver()
export class PingCounterGraphQLTransport {

  constructor(@Inject(PingCounterAppDIToken.APILayer) private readonly app: PingCounterApp) { }

  @Query(() => PingCounterGraphQL)
  async get(): Promise<PingCounterGraphQL> {
    const result = await this.app.get();
    return {
      id: result.id,
      count: result.count,
      lastPingedAt: result.lastPingedAt,
      createdAt: result.createdAt,
    };
  }

  @Mutation(() => PingCounterGraphQL)
  async ping(): Promise<PingCounterGraphQL> {
    const result = await this.app.ping();
    return {
      id: result.id,
      count: result.count,
      lastPingedAt: result.lastPingedAt,
      createdAt: result.createdAt,
    };
  }
}

