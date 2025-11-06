import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
class PingCounter {
  @Prop()
  id!: string;

  @Prop()
  count!: number;

  @Prop()
  lastPingedAt!: Date;

  @Prop()
  createdAt!: Date;
}

export type PingCounterMongoDocument = HydratedDocument<PingCounter>;

export const PingCounterMongoSchema = SchemaFactory.createForClass(PingCounter);

