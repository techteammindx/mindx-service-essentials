import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
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
        playground: false,
        plugins: [ApolloServerPluginLandingPageLocalDefault()], // enable Apollo sandbox for local dev
        csrfPrevention: false, // turn off CSRF for local dev
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
