import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TeamDocument = TeamEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class TeamEntity {
  _id?: any;

  @Prop({ type: Number, unique: true })
  teamId: number;

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: 'Object' })
  detail: Object;
}

export const TeamSchema = SchemaFactory.createForClass(TeamEntity);
