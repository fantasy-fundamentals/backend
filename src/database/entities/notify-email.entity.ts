import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotifyEmailDocument = NotifyEmailEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class NotifyEmailEntity {
  _id?: any;

  @Prop()
  email: string;
}

export const NotifyEmailSchema =
  SchemaFactory.createForClass(NotifyEmailEntity);
