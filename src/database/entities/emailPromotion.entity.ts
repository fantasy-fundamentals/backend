import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type EmailPromotionDocument = EmailPromotionEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class EmailPromotionEntity {
  _id?: any;

  @Prop()
  firstname: string;

  @Prop()
  lastName: string;

  @Prop()
  telegram: string;

  @Prop()
  role: string;

  @Prop()
  website: string;

  @Prop({ default: false })
  status: boolean;

  @Prop()
  userAddress: string;

  @Prop()
  domain: string;

  @Prop({ type: 'Object' })
  trx: Object;
}

export const EmailPromotionSchema =
  SchemaFactory.createForClass(EmailPromotionEntity);
