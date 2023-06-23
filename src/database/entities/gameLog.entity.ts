import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type GameLogDocument = GameLog &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class GameLog {
  @Prop()
  week: string;

  @Prop()
  winningAmount: number;

  @Prop()
  position: string;
}

export const GameLogSchema = SchemaFactory.createForClass(GameLog);
