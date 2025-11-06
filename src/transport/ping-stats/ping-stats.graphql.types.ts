import { ObjectType, InputType, Field } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';

import { PingStatsQueryTimeFrame } from '@contract/app/ping-stats.app.contract';

@ObjectType()
export class PingStatsGraphQL {
  @Field()
  id!: string;

  @Field()
  value!: number;

  @Field()
  seconds!: number;
}

@ObjectType()
export class PingStatsGraphQLQueryResult {
  @Field(() => [PingStatsGraphQL])
  items!: PingStatsGraphQL[];
}

@InputType()
export class PingStatsGraphQLQueryInput {
  @Field()
  @IsEnum(PingStatsQueryTimeFrame)
  timeFrame!: PingStatsQueryTimeFrame; 
}

