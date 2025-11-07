import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PingCounterGraphQL {
  @Field()
  id!: string;

  @Field()
  count!: number;

  @Field()
  lastPingedAt!: number;

  @Field()
  createdAt!: number;
}

