import { PingCounterEvent } from './ping-counter.event';
import { PingCounterIncrementedEvent } from './ping-counter.incremented.event';

export class PingCounter {

  private _events: PingCounterEvent[];
  
  constructor(
    private _id: string,
    private _value: number = 0,
    private _lastPingedAt: number = new Date().getTime(),
  ) {
    if (!_id) throw new Error('PingCounter id is required');
    if (_value < 0) throw new Error('PingCounter value can not be nagative');
    this._events = [];
  }

  public get id() { return this._id; }
  public get value() { return this._value; }
  public get lastPingedAt() { return this._lastPingedAt; }
  public get events() { return this._events; }

  public increment() {
    const lastValue = this._value;
    this._value += 1;

    this.events.push(
      new PingCounterIncrementedEvent(
        this._id,
        lastValue,
        this._value,
      )
    )
  }
}
