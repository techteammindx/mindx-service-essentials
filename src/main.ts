import { setupGrpcServerApp } from '@infra/grpc/grpc-server.app';
import { setupGraphQLServerApp } from '@infra/graphql/graphql-server.app';

import { AppModule } from './app.module';

async function bootstrap() {
  const graphqlServerApp = await setupGraphQLServerApp(AppModule);
  await graphqlServerApp.listen(process.env.PORT ?? 3000);

  const grpcServerApp = await setupGrpcServerApp(AppModule);
  await grpcServerApp.listen()
}

bootstrap();

