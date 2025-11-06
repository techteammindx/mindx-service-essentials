import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PingCounterRepository } from '@domain/ping-counter/ping-counter.repository';
import { PingCounter } from '@domain/ping-counter/ping-counter';

import { PingCounterPostgresEntity } from '@infra/postgres/entities/ping-counter.postgres.entity';

import { PingCounterPostgresMapper } from './ping-counter.postgres.mapper';

@Injectable()
export class PingCounterPostgresRepository implements PingCounterRepository {
  constructor(
    @InjectRepository(PingCounterPostgresEntity)
    private readonly repository: Repository<PingCounterPostgresEntity>,
    private readonly mapper: PingCounterPostgresMapper = new PingCounterPostgresMapper(),
  ) {
  }

  async getNewId(): Promise<string> {
    return uuidv4();
  }

  async findOne(): Promise<PingCounter | null> {
    const entity = await this.repository.findOneBy({});
    if (!entity) return null;
    return this.mapper.toAggregate(entity);
  }

  async save(counter: PingCounter): Promise<PingCounter> {
    const entity = this.mapper.fromAggregate(counter);
    const newEntity = await this.repository.save(entity);
    return this.mapper.toAggregate(newEntity);
  }
}

