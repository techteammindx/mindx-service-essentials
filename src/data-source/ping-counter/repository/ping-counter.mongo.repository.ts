import { v4 as uuidv4 } from 'uuid';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { PingCounterMongoDIToken } from '@contract/infra/mongo.infra.contract';

import { PingCounterRepository } from '@domain/ping-counter/ping-counter.repository';
import { PingCounter } from '@domain/ping-counter/ping-counter';
import { PingCounterMongoDocument } from '@infra/mongo/schemas/ping-counter.mongo.schema';

import { PingCounterMongoMapper } from './ping-counter.mongo.mapper';

@Injectable()
export class PingCounterMongoRepository implements PingCounterRepository {
  constructor(
    @InjectModel(PingCounterMongoDIToken.Schema) private model: Model<PingCounterMongoDocument>,
  ) {}

  private readonly mapper: PingCounterMongoMapper = new PingCounterMongoMapper()
  
  async getNewId(): Promise<string> {
    return uuidv4();
  }

  async findOne(): Promise<PingCounter | null> {
    const document = await this.model.findOne({}).exec();
    if (!document) return null;
    return this.mapper.toAggregate(document);
  }

  async save(counter: PingCounter): Promise<PingCounter> {
    const { filter, update } = this.mapper.fromAggregateToUpserPayload(counter);
    const options = {
      upsert: true,
      new: true,
    };
    const newDocument = await this.model.findOneAndUpdate(filter, update, options).exec();
    if (!newDocument) {
      throw new Error('Data not found');
    }
    return this.mapper.toAggregate(newDocument);
  }
}

