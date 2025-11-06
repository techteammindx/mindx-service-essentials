export interface PingStatsDTO {
  id: string;
  seconds: number;
  value: number;
}

export interface PingStatsSaveCommand {
  seconds: number;
  value: number;
}

export enum PingStatsQueryTimeFrame {
  Last5Minute = 'Last5Minute',
  LastHour = 'LastHour'
}

export interface PingStatsQuery {
  timeFrame: PingStatsQueryTimeFrame,
}

export interface PingStatsApp {
  save(command: PingStatsSaveCommand): Promise<PingStatsDTO>;
  query(query: PingStatsQuery): Promise<PingStatsDTO[]>;
}

export interface PingStatsAppFactory {
  get(): PingStatsApp;
}

export enum PingStatsAppDIToken {
  Domain = 'PING_STATS_DOMAIN_APP'
};

