import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
class PingStats {
  @Prop()
  id!: string;

  @Prop()
  value!: number;

  @Prop()
  seconds!: number;
}

export type PingStatsMongoDocument = HydratedDocument<PingStats>;

export const PingStatsMongoSchema = SchemaFactory.createForClass(PingStats);

