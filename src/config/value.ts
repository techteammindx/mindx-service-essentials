import * as z from 'zod';

import { Config } from './type';

export const config: Config = {
  mongo: {
    uri: z.string().parse(process.env.MONGO_URI),
  },
  kafka: {
    brokers: z.array(z.string()).parse(
      z.string().default('').parse(process.env.KAFKA_BROKERS).split(',')
    )
  }
}

