export enum PingCounterQueueMessage {
  Incremented = 'ping_counter.incremented'
}

export interface PingCounterIncrementedQueueMessage {
  id: string;
  beforeCount: number;
  afterCount: number;
  timestamp: number;
}

