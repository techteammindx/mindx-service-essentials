import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PingCounterGraphQLDTO {
  @Field()
  id!: string;

  @Field()
  value!: number;

  @Field()
  lastPingedAt!: number;
}

