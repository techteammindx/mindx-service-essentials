import { NestFactory } from '@nestjs/core';

import { Type } from '@nestjs/common';

export const setupGraphQLServerApp = async (InputMode: Type<any>) => {
  const app = await NestFactory.create(InputMode);
  return app;
}

