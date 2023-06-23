import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CounterDocument = CounterEntity & Document

@Schema()
export class CounterEntity {
  @Prop({ type: String, unique: true, required: true })
  collectionName: string;

  @Prop({ type: Number, default: 1001 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(CounterEntity);
