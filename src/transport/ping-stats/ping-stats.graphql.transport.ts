import { Inject } from '@nestjs/common';

import { Resolver, Query, Args } from '@nestjs/graphql';

import { PingStatsApp, PingStatsAppDIToken } from '@contract/app/ping-stats.app.contract';

import { PingStatsGraphQLQueryResult, PingStatsGraphQLQueryInput } from './ping-stats.graphql.types';

@Resolver()
export class PingStatsGraphQLTransport {

  constructor(@Inject(PingStatsAppDIToken.Domain) private readonly app: PingStatsApp) {}

  @Query(() => PingStatsGraphQLQueryResult)
  async getPingStats(@Args('input') input: PingStatsGraphQLQueryInput): Promise<PingStatsGraphQLQueryResult> {
    const results = await this.app.query(input);
    return {
      items: results.map((result) => ({
        id: result.id,
        value: result.value,
        seconds: result.seconds,
      }))
    } 
  }
}

