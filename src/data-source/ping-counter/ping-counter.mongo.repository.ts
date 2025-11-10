import { v4 as uuid4 } from 'uuid';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { PingCounter } from '@domain/ping-counter/ping-counter';
import { PingCounterRepository } from '@domain/ping-counter/ping-counter.repository';

import { MongoInfraInjectToken } from '@contract/infra/mongo.infra.contract';
import { PingCounterMongoModel } from '@infra/mongo/schema/ping-counter.schema';

@Injectable()
export class PingCounterMongoRepository implements PingCounterRepository {

  constructor(
    @InjectModel(MongoInfraInjectToken.Module) private readonly model: PingCounterMongoModel,
  ) {}

  async get() {
    const document = await this.model.findOne({}).exec();
    
    if (!document) return null;

    return new PingCounter(
      document.id,
      document.value,
      document.lastPingedAt,
    );
  }

  async getNewId() {
    return uuid4();
  }

  async save(entity: PingCounter) {
    const filter = { id: entity.id };
    const update = {
      value: entity.value,
      lastPingedAt: entity.lastPingedAt,
    };
    const options = {
      upsert: true,
      new: true,
    };

    const newDocument = await this.model.findOneAndUpdate(filter, update, options).exec();
    if (!newDocument) {
      throw new Error('Pingcounter upsert failed, null was returned');
    }
    return new PingCounter(
      newDocument.id,
      newDocument.value,
      newDocument.lastPingedAt,
    );
  }
}
