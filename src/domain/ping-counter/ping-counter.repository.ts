import { PingCounter } from './ping-counter';

export interface PingCounterRepository {
  getNewId(): Promise<string>;
  findOne(): Promise<PingCounter | null>;
  save(counter: PingCounter): Promise<PingCounter>;
}

