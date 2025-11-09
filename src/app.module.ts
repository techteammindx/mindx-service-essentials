import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { PingCounterAPIContainerModule } from '@container/ping-counter.api.container.module';
import { PingCounterDomainContainerModule } from '@container/ping-counter.domain.container.module';
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
    PingCounterAPIContainerModule,
    PingCounterDomainContainerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

