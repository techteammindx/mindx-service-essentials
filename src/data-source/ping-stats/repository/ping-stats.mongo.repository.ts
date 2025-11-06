import { v4 as uuid4 } from 'uuid';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { PingStats } from '@domain/ping-stats/ping-stats';
import { TimeInSecond } from '@domain/ping-stats/time-in-second';
import { RangeInSecond } from '@domain/ping-stats/range-in-second';
import { PingStatsRepository } from '@domain/ping-stats/ping-stats.repository';

import { PingStatsMongoDIToken } from '@contract/infra/mongo.infra.contract';

import { PingStatsMongoDocument } from '@infra/mongo/schemas/ping-stats.mongo.schema';

import { PingStatsMongoMapper } from './ping-stats.mongo.mapper';

@Injectable()
export class PingStatsMongoRepository implements PingStatsRepository {

  private readonly mapper: PingStatsMongoMapper;

  constructor(
    @InjectModel(PingStatsMongoDIToken.Schema) private readonly model: Model<PingStatsMongoDocument>,
  ) {
    this.mapper = new PingStatsMongoMapper();
  }

  async getNewId(): Promise<string> {
    return uuid4();
  }

  async findOneBySeconds(seconds: TimeInSecond): Promise<PingStats | null> {
    const document = await this.model.findOne({
      seconds: seconds.value,
    });
    if (!document) return null;
    return this.mapper.toAggregate(document);
  }

  async save(stats: PingStats): Promise<PingStats> {
    const { filter, update } = this.mapper.fromAggregateToUpsertPayload(stats);
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

  async findInRange(range: RangeInSecond): Promise<PingStats[]> {
    const filter = {
      seconds: {
        '$gte': range.from.value,
        '$lte': range.to.value,
      }
    };
    const documents = await this.model.find(filter).exec();
    return documents.map(this.mapper.toAggregate);
  }
}

