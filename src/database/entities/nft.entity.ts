import { Document, Model } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type NftMeta = {
  name: string;
  quantity: number;
  videoUrl: string;
};

export type NftDocument = NftEntity & Document;
@Schema({ timestamps: true })
export class NftEntity {
  @Prop({
    type: Number,
    required: true,
    unique: true,
  })
  nftId: number;

  @Prop({
    type: Number,
    required: true,
  })
  playerId: number;

  @Prop({
    type: Number,
    required: false,
    default: 0,
  })
  rating: number;

  @Prop({
    type: Array,
  })
  historicalRating: [];

  @Prop({
    type: Number,
    required: false,
  })
  lastValue: number;

  @Prop({
    type: Object,
    required: true,
  })
  playerDetail: object;

  @Prop({
    type: Object,
    required: false,
  })
  meta: NftMeta;

  @Prop({
    type: Number,
    required: false,
  })
  value: number;

  @Prop({ default: false })
  status: boolean;
}

export const NftSchema = SchemaFactory.createForClass(NftEntity);
