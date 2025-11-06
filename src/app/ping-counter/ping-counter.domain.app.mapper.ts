import { PingCounter } from '@domain/ping-counter/ping-counter';
import { PingCounterAppDTO } from '@contract/app/ping-counter.app.contract';

export class PingCounterDomainAppMapper {
  toDTO(pingCounter: PingCounter): PingCounterAppDTO {
    return {
      id: pingCounter.id,
      count: pingCounter.count,
      lastPingedAt: pingCounter.lastPingedAt.getTime(),
      createdAt: pingCounter.createdAt.getTime(),
    };
  }
}

