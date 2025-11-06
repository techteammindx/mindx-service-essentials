import { PingCounterEvent } from './ping-counter.event';
import { PingCounterIncrementedEvent } from './ping-counter.incremented.event';

export class PingCounter {
  private _id: string;
  private _count: number;
  private _lastPingedAt: Date;
  private _createdAt: Date;
  private _events: PingCounterEvent[];

  public get id(): string { return this._id; }
  public get count(): number { return this._count; }
  public get lastPingedAt(): Date { return this._lastPingedAt; }
  public get createdAt(): Date { return this._createdAt; }
  public get events(): PingCounterEvent[] { return this._events; }

  public constructor(id: string, count: number = 0, lastPingedAt: Date = new Date(), createdAt: Date = new Date()) {
    if (!id) throw new Error('PingCounter id is required');
    if (count < 0) throw new Error('PingCounter count cannot be negative');

    this._id = id;
    this._count = count;
    this._lastPingedAt = lastPingedAt;
    this._createdAt = createdAt;
    this._events = [];
  }
  
  increment(): PingCounter {
    const lastCount = this._count;
    this._count += 1;
    this._lastPingedAt = new Date();
    this._events.push(
      new PingCounterIncrementedEvent(
        this._id,
        lastCount,
        this._count,
        new Date().getTime(),
      )
    );
    return this;
  }
  
  static create(id: string): PingCounter {
    return new PingCounter(id);
  }
}

