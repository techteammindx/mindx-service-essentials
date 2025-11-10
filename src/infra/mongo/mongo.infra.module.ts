import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { config } from '@config/value';

import { MongoInfraInjectToken } from '@contract/infra/mongo.infra.contract';

import { PingCounterMongoSchema } from './schema/ping-counter.schema';

@Global()
@Module({
  imports:[
    MongooseModule.forRoot(config.mongo.uri),
    MongooseModule.forFeature([
      { name: MongoInfraInjectToken.Module, schema: PingCounterMongoSchema, }
    ])
  ],
  exports: [MongooseModule]
})
export class MongoInfraModule {}

