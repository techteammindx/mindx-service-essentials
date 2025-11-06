import { z } from 'zod';

import {
  Config,
  TransportProtocol,
  DataSourceProtocol,
} from './types';

export const config: Config = {
  transportProtocols: z.array(z.enum(TransportProtocol)).parse(
    z.string().default('').parse(process.env.TRANSPORT_PROTOCOLS).split(',')
  ),
  dataSourceProtocols: z.array(z.enum(DataSourceProtocol)).parse(
    z.string().default('').parse(process.env.DATA_SOURCE_PROTOCOLS).split(',')
  ),
  kafka: {
    brokers: z.string().default('').parse(process.env.KAFKA_BROKERS).split(','),
  },
  grpc: {
    serviceUrl: z.string().default('').parse(process.env.GRPC_SERVICE_URL),
  },
  mongo: {
    uri: z.string().default('').parse(process.env.MONGO_URI),
  },
};

