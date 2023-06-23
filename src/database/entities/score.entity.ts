import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ScoreDocument = ScoreEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class ScoreEntity {
  _id?: any;

  @Prop({ type: Number, unique: true })
  gameKey: number;

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: Object })
  detail: object;
}

export const ScoreSchema = SchemaFactory.createForClass(ScoreEntity);
