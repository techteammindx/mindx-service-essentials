import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { PingCounterEvent } from '@domain/ping-counter/ping-counter.event';
import { PingCounterIncrementedEvent } from '@domain/ping-counter/ping-counter.incremented.event';
import { PingCounterEventPublisher } from '@domain/ping-counter/ping-counter.event-publisher';

import { RabbitMQInfraDIToken, PingCounterRabbitMQMessagePattern } from '@contract/infra/rabbitmq.infra.contract';

@Injectable()
export class PingCounterRabbitMQEventPublisher implements PingCounterEventPublisher {
  constructor(
    @Inject(RabbitMQInfraDIToken.ClientModule) private readonly client: ClientProxy,
  ) {}

  public async publish(event: PingCounterEvent): Promise<void> {
    if (event instanceof PingCounterIncrementedEvent) {
      this.client.emit(PingCounterRabbitMQMessagePattern.Incremented, event);
    } 
  }
}

