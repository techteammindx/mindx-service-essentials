export enum TransportProtocol {
  GRAPHQL = 'GRAPHQL',
  GRPC = 'GRPC',
  KAFKA = 'KAFKA',
  RABBITMQ = 'RABBITMQ',
};

export enum DataSourceProtocol {
  MONGO = 'MONGO',
  POSTGRES = 'POSTGRES',
  KAFKA = 'KAFKA',
  RABBITMQ = 'RABBITMQ',
  GRPC = 'GRPC', 
};

interface MongoConfig {
  uri: string;
}

interface KafkaConfig {
  brokers: string[];
}

interface GrpcConfig {
  serviceUrl: string;
}

export interface Config {
  transportProtocols: TransportProtocol[],
  dataSourceProtocols: DataSourceProtocol[],
  mongo: MongoConfig,
  kafka: KafkaConfig,
  grpc: GrpcConfig,
};

