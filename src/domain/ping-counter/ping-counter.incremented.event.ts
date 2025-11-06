export class PingCounterIncrementedEvent {
  public constructor(
    readonly id: string,
    readonly beforeCount: number,
    readonly afterCount: number,
    readonly timestamp: number,
  ) {}
}
