import { Resolver, Query } from '@nestjs/graphql';
import { PingCounterGraphQLDTO } from './ping-counter.graphql.schema.transport';

@Resolver()
export class PingCounterGraphQLResolverTransport {

  @Query(() => PingCounterGraphQLDTO)
  async get(): Promise<PingCounterGraphQLDTO> {
    return {
      id: 'id',
      value: 0,
      lastPingedAt: new Date().getTime(),
    }
  }
}
