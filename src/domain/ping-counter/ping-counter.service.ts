import { PingCounter } from './ping-counter';
import { PingCounterRepository } from './ping-counter.repository';
import { PingCounterEventPublisher } from './ping-counter.event-publisher';

export class PingCounterService {
  constructor(
    private readonly repository: PingCounterRepository,
    private readonly eventPublisher: PingCounterEventPublisher,
  ) {}

  async get(): Promise<PingCounter> {
    let pingCounter = await this.repository.get();
    if (!pingCounter) {
      const newId = await this.repository.getNewId();
      const newPingCounter = new PingCounter(newId);
      pingCounter = await this.repository.save(newPingCounter);
    }
    return pingCounter;
  }

  async ping(): Promise<PingCounter> {
    let pingCounter = await this.repository.get();
    if (!pingCounter) {
      const newId = await this.repository.getNewId();
      const newPingCounter = new PingCounter(newId);
      pingCounter = await this.repository.save(newPingCounter);
    }

    pingCounter.increment();
    const newPingCounter = await this.repository.save(pingCounter);
    
    pingCounter.events.forEach(async (event) => {
      await this.eventPublisher.publish(event);
    });

    return newPingCounter;
  }
}
