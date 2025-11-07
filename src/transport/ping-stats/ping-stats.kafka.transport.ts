import {
  Controller,
  Inject,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices'; 

import { PingCounterIncrementedEvent } from '@domain/ping-counter/ping-counter.incremented.event';

import { PingStatsApp, PingStatsAppDIToken } from '@contract/app/ping-stats.app.contract';
import { PingCounterKafkaTopic } from '@contract/infra/kafka.infra.contract';

@Controller()
export class PingStatsKafkaTransport {

  constructor(@Inject(PingStatsAppDIToken.Domain) private readonly app: PingStatsApp) { }
  
  @EventPattern(PingCounterKafkaTopic.Incremented)
  async handleEvent(@Payload() message: PingCounterIncrementedEvent) {
    console.log('Received kafka event for "ping_counter.incremented' + JSON.stringify(message));
    await this.app.save({
      seconds: Math.floor(message.timestamp / 1000),
      value: message.afterCount,
    });
  }
}

