import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PlayerEntity } from './player.entity';

export type PlayerFavoriteDocument = PlayerFavoriteEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class PlayerFavoriteEntity {
  _id?: any;

  @Prop()
  email: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PlayerEntity' })
  player: PlayerEntity;
}

export const PlayerFavoriteSchema =
  SchemaFactory.createForClass(PlayerFavoriteEntity);
