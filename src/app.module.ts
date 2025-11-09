import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { PingCounterContainerModule } from '@container/ping-counter.container.module';

import { GrpcClientDataSourceModule } from '@infra/grpc/grpc-client.data-source.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: false, 
      graphiql: true,
    }),
    GrpcClientDataSourceModule,
    PingCounterContainerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

