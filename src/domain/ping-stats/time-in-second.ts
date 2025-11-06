export class TimeInSecond {
  private static readonly MAX = 1e12;
  
  constructor(private readonly _value: number) {
    if (!Number.isInteger(_value)) throw new Error('Provided value not whole seconds');
    if (_value < 0) throw new Error('Provided value is negative');
    if (_value >= TimeInSecond.MAX) throw new Error('Provided value too large, miliseconds is passed instead?');
  }

  public get value() { return this._value; }

  public equalOrGreater(other: TimeInSecond) {
    return this._value >= other._value;
  } 

  public static fromDate(d: Date) {
    const miliseconds = d.getTime();
    if (!Number.isFinite(miliseconds)) {
      throw new Error('Provided date is not finite');
    }
    return new TimeInSecond(
      Math.floor(miliseconds / 1000)
    );
  }
}
