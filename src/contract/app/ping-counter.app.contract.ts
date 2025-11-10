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
  API = 'PING_COUNTER_API_LAYER_APP',
  Domain = 'PING_COUNTER_DOMAIN_APP'
}

