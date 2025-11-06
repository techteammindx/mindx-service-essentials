export interface PingCounterDomainServiceDTO {
  id: string;
  count: number;
  createdAt: number;
  lastPingedAt: number;
}

export interface PingCounterDomainService {
  get(): Promise<PingCounterDomainServiceDTO>;
  ping(): Promise<PingCounterDomainServiceDTO>;
}

export enum PingCounterDataSourceDIToken {
  Repository = 'PING_COUNTER_REPOSITORY',
  EventPublisher = 'PING_COUNTER_EVENT_PUBLISHER',
  DomainService = 'PING_COUNTER_DOMAIN_SERVICE',
};

