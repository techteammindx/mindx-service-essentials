export interface PingCounterAppDTO {
  id: string;
  value: number;
  lastPingedAt: number;
}

export interface PingCounterApp {
  get(): Promise<PingCounterAppDTO>;
  ping(): Promise<PingCounterAppDTO>;
}

export enum PingCounterAppInjectToken {
  APILayer = 'PING_COUNTER_API_LAYER_APP',
}
