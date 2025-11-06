import { config } from '@config/value';
import { TransportProtocol } from '@config/types';

import { AppModule } from './app.module';

import { setupGraphQLServerApp } from './infra/graphql/graphql-server.app';
import { setupGrpcServerApp } from './infra/grpc/grpc-server.app';
import { setupKafkaServerApp } from './infra/kafka/kafka-server.app';
import { setupRabbitMQServerApp } from './infra/rabbitmq/rabbitmq-server.app';

async function bootstrap() {
  if (config.transportProtocols.includes(TransportProtocol.GRAPHQL)) {
    const graphqlApp = await setupGraphQLServerApp(AppModule);
    graphqlApp.listen();
  }

  if (config.transportProtocols.includes(TransportProtocol.GRPC)) {
    const grpcApp = await setupGrpcServerApp(AppModule);
    grpcApp.listen();
  }
  
  if (config.transportProtocols.includes(TransportProtocol.KAFKA)) {
    const kafkaApp = await setupKafkaServerApp(AppModule);
    kafkaApp.listen();
  }

  if (config.transportProtocols.includes(TransportProtocol.RABBITMQ)) {
    const rabbitMQApp = await setupRabbitMQServerApp(AppModule);
    rabbitMQApp.listen();
  }
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap application:', error);
  process.exit(1);
});

