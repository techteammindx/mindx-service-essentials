import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

import { PingCounterEvent } from '@domain/ping-counter/ping-counter.event';
import { PingCounterIncrementedEvent } from '@domain/ping-counter/ping-counter.incremented.event';
import { PingCounterEventPublisher } from '@domain/ping-counter/ping-counter.event-publisher';

import { KafkaInfraDIToken, PingCounterKafkaTopic } from '@contract/infra/kafka.infra.contract';

@Injectable()
export class PingCounterKafkaEventPublisher implements PingCounterEventPublisher {
  constructor(
    @Inject(KafkaInfraDIToken.ClientModule) private readonly client: ClientKafka,
  ) {}

  public async publish(event: PingCounterEvent): Promise<void> {
    if (event instanceof PingCounterIncrementedEvent) {
      this.client.emit(PingCounterKafkaTopic.Incremented, event);
    }
  }
}

