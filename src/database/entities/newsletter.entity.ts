import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsLetterDocument = NewsLetter &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class NewsLetter {
  _id?: any;

  @Prop()
  email: string;
}

export const NewsLetterSchema = SchemaFactory.createForClass(NewsLetter);
