import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CurrencyDocument = Currency &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class Currency {
  _id?: any;

  @Prop({ unique: true })
  name: string;

  @Prop({ unique: true })
  code: string;

  @Prop({ type: Boolean, default: false })
  isDefault?: boolean;

  @Prop({ type: Boolean, default: true })
  isActive?: boolean;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
