export enum TransportProtocol {
  GRAPHQL = 'GRAPHQL',
  GRPC = 'GRPC',
  KAFKA = 'KAFKA',
  RABBITMQ = 'RABBITMQ',
};

export enum DataSourceDriver {
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

interface RabbitMQConfig {
  serverUrl: string;
  queueName: string;
}

export interface Config {
  transportProtocols: TransportProtocol[],
  dataSourceDrivers: DataSourceDriver[],
  mongo: MongoConfig,
  kafka: KafkaConfig,
  grpc: GrpcConfig,
  rabbitmq: RabbitMQConfig,
};

