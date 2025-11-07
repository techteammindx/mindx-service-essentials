import { z } from 'zod';

import {
  Config,
  TransportProtocol,
  DataSourceDriver,
} from './types';

export const config: Config = {
  transportProtocols: z.array(z.enum(TransportProtocol)).parse(
    z.string().default('').parse(process.env.TRANSPORT_PROTOCOLS).split(',')
  ),
  dataSourceDrivers: z.array(z.enum(DataSourceDriver)).parse(
    z.string().default('').parse(process.env.DATA_SOURCE_DRIVERS).split(',')
  ),
  kafka: {
    brokers: z.string().default('').parse(process.env.KAFKA_BROKERS).split(','),
  },
  rabbitmq: {
    serverUrl: z.string().default('').parse(process.env.RABBITMQ_SERVER_URL),
    queueName: z.string().default('').parse(process.env.RABBITMQ_QUEUE_NAME),
  },
  grpc: {
    serviceUrl: z.string().default('').parse(process.env.GRPC_SERVICE_URL),
  },
  mongo: {
    uri: z.string().default('').parse(process.env.MONGO_URI),
  },
};

