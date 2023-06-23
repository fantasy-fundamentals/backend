import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WatchListDocument = WatchListEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class WatchListEntity {
  _id?: any;

  @Prop()
  walletAddress: string;

  @Prop()
  coinId: string;

  @Prop({ type: 'Object' })
  coin: object;
}

export const WatchListSchema = SchemaFactory.createForClass(WatchListEntity);
