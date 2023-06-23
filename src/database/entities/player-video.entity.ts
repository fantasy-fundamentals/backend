import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PlayerVideoDocument = PlayerVideoEntity & Document;

@Schema()
export class PlayerVideoEntity {
  @Prop({ type: String, unique: true, required: true })
  playerName: string;

  @Prop({ type: String, unique: true, required: true })
  playerId: string;

  @Prop({ type: String, unique: true, required: true })
  videoUrl: string;
}

export const PlayerVideoSchema =
  SchemaFactory.createForClass(PlayerVideoEntity);
