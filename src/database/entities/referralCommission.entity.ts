import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReferralCommissionDocument = ReferralCommissionEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class ReferralCommissionEntity {
  _id?: any;

  @Prop({ default: 0 })
  commission: number;

  @Prop()
  address: string;

  @Prop({ type: 'Object' })
  coin: object;

  @Prop()
  referralCode: string;
}

export const ReferralCommissionSchema = SchemaFactory.createForClass(
  ReferralCommissionEntity,
);
