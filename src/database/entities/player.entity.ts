import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PlayerFavoriteEntity } from './player-favorite.entity';
import { NftEntity } from './nft.entity';

export type PlayerDocument = PlayerEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class PlayerEntity {
  _id?: any;

  @Prop({ type: Number, unique: true })
  playerId: number;

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: Number, default: 0, required: false })
  value: number;

  @Prop({ type: 'Object' })
  detail: Object;

  @Prop({ type: Array })
  games?: [];

  @Prop({ type: 'Object' })
  fantasyData: Object;

  @Prop({ type: Number })
  rating?: number;

  @Prop({ type: Number, default: 0 })
  won?: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'NftEntity',
  })
  nftId?: NftEntity;

  @Prop({
    type: Array,
  })
  historicalRating?: [];

  @Prop({ type: 'Object' })
  nft?: Object;

  @Prop({ default: false })
  isMinted: boolean;
}

export const PlayerSchema = SchemaFactory.createForClass(PlayerEntity);
