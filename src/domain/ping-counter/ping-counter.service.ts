import { PingCounter } from './ping-counter';

import { PingCounterRepository } from './ping-counter.repository';
import { PingCounterEventPublisher } from './ping-counter.event-publisher';

export class PingCounterService implements PingCounterService {
  constructor(
    private readonly repository: PingCounterRepository,
    private readonly eventPublisher: PingCounterEventPublisher,
  ) {}

  public async get(): Promise<PingCounter> {
    let counter = await this.repository.findOne();
    if (!counter) {
      const newId = await this.repository.getNewId();
      const newCounter = new PingCounter(newId);
      counter = await this.repository.save(newCounter);
    }
    return counter;
  }
  
  public async increment(): Promise<PingCounter> {
    let counter = await this.repository.findOne();

    if (!counter) {
      const newId = await this.repository.getNewId();
      counter = PingCounter.create(newId);
    }

    counter.increment();
    const newCounter = await this.repository.save(counter);

    counter.events.forEach(async (event) => {
      await this.eventPublisher.publish(event);
    });

    return newCounter;
  }
}

