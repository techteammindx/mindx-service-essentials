import { PingCounter } from './ping-counter';

export interface PingCounterRepository {
  getNewId(): Promise<string>;
  get(): Promise<PingCounter | null>;
  save(entity: PingCounter): Promise<PingCounter>;
}
