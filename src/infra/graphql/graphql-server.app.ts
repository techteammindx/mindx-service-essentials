import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module, Type, ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';

export async function setupGraphQLServerApp (InputModule: Type<any>) {
  @Module({
    imports: [
      InputModule,
      GraphQLModule.forRoot<ApolloDriverConfig>({
        driver: ApolloDriver,
        autoSchemaFile: 'schema.gql',
        sortSchema: true,
        debug: true,
      }),
    ]
  })
  class OutputModule {}

  const app = await NestFactory.create(OutputModule);
  app.useGlobalPipes(new ValidationPipe());
  return {
    ...app,
    listen: () => {
      app.listen(5555);
    },
  };
}

