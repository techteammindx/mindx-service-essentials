import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { Type } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

export const setupGraphQLServerApp = async (InputModule: Type<any>) => {
  @Module({
    imports: [
      GraphQLModule.forRoot<ApolloDriverConfig>({
        driver: ApolloDriver,
        autoSchemaFile: 'schema.gql',
        playground: false,
        graphiql: true,
      }),
      InputModule,
    ]
  })
  class GraphQLServerModule {}

  const app = await NestFactory.create(GraphQLServerModule);
  return app;
}

