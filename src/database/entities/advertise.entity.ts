import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdvertiseDocument = AdvertiseEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class AdvertiseEntity {
  _id?: any;

  @Prop()
  title: string;

  @Prop()
  price: number;

  @Prop({ default: false })
  status: boolean;
}

export const AdvertiseSchema = SchemaFactory.createForClass(AdvertiseEntity);
