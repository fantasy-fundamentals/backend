import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NATIVE_WALLETS_TYPE } from 'src/utils/misc/enum';

export type NativeWalletDocument = NativeWalletEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class NativeWalletEntity {
  _id?: any;

  @Prop({ type: String })
  type: NATIVE_WALLETS_TYPE;

  @Prop({ default: 0 })
  balance: number;

  @Prop()
  address: string;

  @Prop()
  publicKey: string;

  @Prop()
  hdPath: string;

  @Prop()
  privateKey: string;

  @Prop()
  coinSymbol: string;

  @Prop({ default: true })
  isERC20: boolean;

  @Prop({ default: false })
  isBEP20: boolean;
}

export const NativeWalletSchema =
  SchemaFactory.createForClass(NativeWalletEntity);
