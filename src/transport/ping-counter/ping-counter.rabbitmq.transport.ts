import {
  Controller,
  //Inject
} from '@nestjs/common';
//import { MessagePattern } from '@nestjs/microservices';

//import { PingCounterApp, PingCounterAppFactory, PingCounterAppDIToken } from '@contract/app/ping-counter.app.contract';

@Controller()
export class PingCounterRabbitMQTransport {
  //private readonly app: PingCounterApp;
  //constructor(@Inject(PingCounterAppDIToken.AppFactory) factory: PingCounterAppFactory ) {
  //  this.app = factory.get();
  //}
  //
  //@MessagePattern(PingCounterQueueMessage.Incremented)
  //.handleEvent() {
  //  console.log('Received rabbitmq event for "ping_counter.incremented');  
  //}
}

