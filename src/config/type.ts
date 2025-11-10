interface MongoConfig {
  uri: string;
}

interface KafkaConfig {
  brokers: string[];
}

export interface Config {
  mongo: MongoConfig;
  kafka: KafkaConfig;
}

