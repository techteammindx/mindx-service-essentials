import { Module } from '@nestjs/common';
import { PingCounterGraphQLResolverTransport } from '@transport/graphql/ping-counter.graphql.transport';

@Module({
  providers: [
    PingCounterGraphQLResolverTransport,
  ]
})
export class PingCounterContainerModule {};

