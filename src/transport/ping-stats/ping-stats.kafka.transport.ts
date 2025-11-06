import {
  Controller,
  Inject,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices'; 

import { PingStatsApp, PingStatsAppDIToken } from '@contract/app/ping-stats.app.contract';
import { PingCounterQueueMessage, PingCounterIncrementedQueueMessage } from '@contract/queue/queue.contract';

@Controller()
export class PingStatsKafkaTransport {

  constructor(@Inject(PingStatsAppDIToken.Domain) private readonly app: PingStatsApp) { }
  
  @EventPattern(PingCounterQueueMessage.Incremented)
  async handleEvent(@Payload() message: PingCounterIncrementedQueueMessage) {
    console.log('Received kafka event for "ping_counter.incremented' + JSON.stringify(message));
    await this.app.save(
      {
        seconds: Math.floor(message.timestamp / 1000),
        value: message.afterCount,
      }
    )
  }
}

