import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

import { PingCounterEvent } from '@domain/ping-counter/ping-counter.event';
import { PingCounterIncrementedEvent } from '@domain/ping-counter/ping-counter.incremented.event';
import { PingCounterEventPublisher } from '@domain/ping-counter/ping-counter.event-publisher';

import { KafkaInfraInjectToken, PingCounterKafkaTopic } from '@contract/infra/kafka.infra.contract';

@Injectable()
export class PingCounterKafkaEventPublisher implements PingCounterEventPublisher {
  
  constructor(
    @Inject(KafkaInfraInjectToken.ClientModule) private readonly client: ClientKafka
  ) {} 

  async publish(event: PingCounterEvent) {
    if (event instanceof PingCounterIncrementedEvent) {
      this.client.emit(PingCounterKafkaTopic.Incremented, event);
    }
  }
}
