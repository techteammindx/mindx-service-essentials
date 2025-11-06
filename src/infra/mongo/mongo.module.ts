import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { config } from '@config/value';

import { PingCounterMongoDIToken, PingStatsMongoDIToken } from '@contract/infra/mongo.infra.contract';

import { PingCounterMongoSchema } from './schemas/ping-counter.mongo.schema';
import { PingStatsMongoSchema } from './schemas/ping-stats.mongo.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(config.mongo.uri),
    MongooseModule.forFeature([
      { name: PingCounterMongoDIToken.Schema, schema: PingCounterMongoSchema },
      { name: PingStatsMongoDIToken.Schema, schema: PingStatsMongoSchema }
    ]),
  ],
  exports: [
    MongooseModule
  ]
})
export class MongoModule {}

