import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

import { PingCounterEvent } from '@domain/ping-counter/ping-counter.event';
import { PingCounterIncrementedEvent } from '@domain/ping-counter/ping-counter.incremented.event';
import { PingCounterEventPublisher } from '@domain/ping-counter/ping-counter.event-publisher';

import { KAFKA_CLIENT_MODULE_NAME } from '@contract/infra/kafka.infra.contract';

import { PingCounterQueueMessage } from '@contract/queue/queue.contract';

@Injectable()
export class PingCounterKafkaEventPublisher implements PingCounterEventPublisher {
  constructor(
    @Inject(KAFKA_CLIENT_MODULE_NAME) private readonly client: ClientKafka,
  ) {}

  public async publish(event: PingCounterEvent): Promise<void> {
    if (event instanceof PingCounterIncrementedEvent) {
      this.client.emit(PingCounterQueueMessage.Incremented, event);
    }
  }
}

