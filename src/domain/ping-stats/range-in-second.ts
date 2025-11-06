import { TimeInSecond } from './time-in-second';

export class RangeInSecond {
  constructor(
    private readonly _from: TimeInSecond,
    private readonly _to: TimeInSecond
  ) {
    if (!_to.equalOrGreater(_from)) throw new Error('Provided "to" is smaller than "from"');
  }

  public get from() { return this._from; }
  public get to() { return this._to; }
}

