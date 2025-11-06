import { PingCounterEvent } from './ping-counter.event';

export interface PingCounterEventPublisher {
  publish(event: PingCounterEvent): Promise<void>;
}

