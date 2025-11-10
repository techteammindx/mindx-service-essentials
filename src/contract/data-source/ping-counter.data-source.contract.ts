export interface PingCounterDomainServiceDTO {
  id: string;
  value: number;
  lastPingedAt: number;
}

export interface PingCounterDomainService {
  get(): Promise<PingCounterDomainServiceDTO>;
  ping(): Promise<PingCounterDomainServiceDTO>;
}

export enum PingCounterDataSourceInjectToken {
  DomainService = 'PING_COUNTER_DOMAIN_SERVICE_DATA_SOURCE',
  Repository = 'PING_COUNTER_REPOSITORY',
  EventPublisher = 'PING_COUNTER_EVENT_PUBLISHER'
}

