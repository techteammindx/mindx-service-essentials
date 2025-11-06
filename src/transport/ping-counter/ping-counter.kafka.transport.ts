import { 
  Controller,
  //Inject
} from '@nestjs/common';
//import { EventPattern } from '@nestjs/microservices'; 

//import { PingCounterApp, PingCounterAppFactory, PingCounterAppDIToken } from '@contract/app/ping-counter.app.contract';
//import { PingCounterQueueMessage } from '@contract/queue/queue.contract';

@Controller()
export class PingCounterKafkaTransport {

  //private readonly app: PingCounterApp;

  //constructor(@Inject(PingCounterAppDIToken.AppFactory) appFactory: PingCounterAppFactory) {
  //  this.app = appFactory.get();
  //}
  //
  //@EventPattern(PingCounterQueueMessage.Incremented)
  //.handleEvent() {
  //  console.log('Received kafka event for "ping_counter.incremented');
  //}
}

