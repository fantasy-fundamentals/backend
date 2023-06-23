import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CoinManagemnetDocument = CoinManagemnetEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class CoinManagemnetEntity {
  _id?: any;

  @Prop()
  name: string;

  @Prop({ unique: true })
  symbol: string;

  @Prop({ type: 'Object' })
  coin: object;

  @Prop()
  description: string;

  @Prop()
  logo: string;

  @Prop()
  launchDate: Date;

  @Prop()
  chain: string;

  @Prop()
  userAddress: string;

  @Prop()
  address: string;

  @Prop()
  contactEmail: string;

  @Prop()
  contactTelegram: string;

  @Prop()
  website: string;

  @Prop()
  twitter: string;

  @Prop()
  telegram: string;

  @Prop()
  redit: string;

  @Prop()
  discord: string;

  @Prop()
  github: string;

  @Prop()
  referralCode: string;

  @Prop({ default: false })
  approveStatus: boolean;

  @Prop({ default: false })
  kycApproved: boolean;

  @Prop({ default: 0 })
  votes: number;

  @Prop({ default: false })
  deployed: boolean;

  @Prop({ type: 'Object' })
  deployedContract: object;

  @Prop({ default: false })
  block: boolean;

  @Prop()
  blockReason: string;

  @Prop()
  favorite?: boolean;
}

export const CoinManagemnetSchema =
  SchemaFactory.createForClass(CoinManagemnetEntity);
