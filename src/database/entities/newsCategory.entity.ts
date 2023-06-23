import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsCategoryDocument = NewsCategoryEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class NewsCategoryEntity {
  _id?: any;

  @Prop()
  title: string;

  @Prop({ default: true })
  active: boolean;
}

export const NewsCategorySchema =
  SchemaFactory.createForClass(NewsCategoryEntity);
