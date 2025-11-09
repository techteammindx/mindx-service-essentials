import { PingCounterApp } from '@contract/app/ping-counter.app.contract';

export class PingCounterDomainApp implements PingCounterApp {
  async get() {
    return {
      id: 'id',
      value: 2,
      lastPingedAt: new Date().getTime(),
    }
  }
  
  async ping() {
    return {
      id: 'id',
      value: 3,
      lastPingedAt: new Date().getTime(),
    }
  }
}
