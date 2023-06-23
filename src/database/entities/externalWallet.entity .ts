import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EXTERNAL_WALLETS_TYPE } from 'src/utils/misc/enum';

export type ExternalWalletDocument = ExternalWalletEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class ExternalWalletEntity {
  _id?: any;

  @Prop({ type: String })
  type: EXTERNAL_WALLETS_TYPE;

  @Prop({ default: 0 })
  balance: number;

  @Prop()
  address: string;

  @Prop()
  coinSymbol: string;

  @Prop({ default: true })
  isERC20: boolean;

  @Prop({ default: false })
  isBEP20: boolean;
}

export const ExternalWalletSchema =
  SchemaFactory.createForClass(ExternalWalletEntity);
