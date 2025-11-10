export class PingCounterIncrementedEvent {
  constructor(
    private readonly _id: string,
    private readonly _lastValue: number,
    private readonly _value: number,
    private readonly _timestamp: number = new Date().getTime(),
  ) {}
}

