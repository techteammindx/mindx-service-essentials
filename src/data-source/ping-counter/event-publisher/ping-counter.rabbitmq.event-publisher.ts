import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { PingCounterEvent } from '@domain/ping-counter/ping-counter.event';
import { PingCounterEventPublisher } from '@domain/ping-counter/ping-counter.event-publisher';

import { RABBITMQ_CLIENT_MODULE_NAME, RABBITMQ_MESSAGE_PATTERN_PING_COUNTER } from '@infra/rabbitmq/constants';

@Injectable()
export class PingCounterRabbitMQEventPublisher implements PingCounterEventPublisher {
  constructor(
    @Inject(RABBITMQ_CLIENT_MODULE_NAME) private readonly client: ClientProxy,
  ) {
  }

  public async publish(event: PingCounterEvent): Promise<void> {
    this.client.emit(RABBITMQ_MESSAGE_PATTERN_PING_COUNTER, event);
  }
}

