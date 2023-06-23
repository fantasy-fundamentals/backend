import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsDocument = NewsEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class NewsEntity {
  _id?: any;

  @Prop({ type: Number, unique: true })
  newsId: number;

  @Prop({ type: String, unique: true })
  slug: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: 'Object' })
  detail: Object;

  @Prop({ required: true })
  coverImage: string;
}

export const NewsSchema = SchemaFactory.createForClass(NewsEntity);
