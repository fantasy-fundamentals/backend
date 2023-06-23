import { Document, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserEntity } from './user.entity';

@Schema({ timestamps: true })
export class WalletEntity {
  _id?: string;

  @Prop({ ref: UserEntity.name })
  userId?: string;

  @Prop()
  userEmail?: string;

  @Prop()
  address: string;

  @Prop()
  publicKey: string;

  @Prop()
  privateKey: string;

  @Prop()
  hdPath: string;

  @Prop({ default: 0 })
  balance?: string;

  @Prop()
  coinSymbol: string;

  @Prop()
  isERC20: boolean;

  @Prop()
  isBEP20: boolean;

  @Prop()
  updatedAt?: string;
}

export type WalletDocument = WalletEntity &
  Document & {
    _id?: any;
  };

export const WalletSchema = SchemaFactory.createForClass(WalletEntity);
