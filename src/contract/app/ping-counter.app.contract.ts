export interface PingCounterAppDTO {
  id: string;
  count: number;
  createdAt: number;
  lastPingedAt: number;
}

export interface PingCounterApp {
  get(): Promise<PingCounterAppDTO>;
  ping(): Promise<PingCounterAppDTO>;
}

export enum PingCounterAppDIToken {
  APILayer = 'PING_COUNTER_API_LAYER_APP',
  Domain = 'PING_COUNTER_DOMAIN_APP',
};

