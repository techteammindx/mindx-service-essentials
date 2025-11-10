import { HydratedDocument, Model } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
class PingCounter {
  @Prop()
  id!: string;

  @Prop()
  value!: number;

  @Prop()
  lastPingedAt!: number;
}

export type PingCounterMongDocument = HydratedDocument<PingCounter>;
export const PingCounterMongoSchema = SchemaFactory.createForClass(PingCounter);
export type PingCounterMongoModel = Model<PingCounter>;

