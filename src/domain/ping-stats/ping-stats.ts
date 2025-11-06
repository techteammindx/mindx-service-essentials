import { TimeInSecond } from './time-in-second';

export class PingStats {
  constructor(
    private _id: string,
    private _seconds: TimeInSecond,
    private _value: number,
  ) {}

  public get id() { return this._id; }
  public get seconds() { return this._seconds; }
  public get value() { return this._value; }

  public set value(next: number) {
    if (next < 0) throw new Error('Provided value is negative'); 
    this._value = next;
  }
}

