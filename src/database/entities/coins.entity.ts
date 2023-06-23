import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { any } from 'joi';
// import { Icon } from './icon.schema';

export type CoinDocument = Coin &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class Coin {
  _id?: any;

  @Prop({ type: 'Object' })
  icon?: Object;

  @Prop({ required: true, unique: true })
  coinSymbol: string;

  @Prop({ required: true })
  name: string;

  @Prop({ Type: Boolean, default: false })
  isErc20?: boolean;

  @Prop({ Type: Boolean, default: false })
  isBep20?: boolean;

  @Prop()
  contractAddress?: string;

  @Prop({ type: Object })
  contractAbi?: any;

  @Prop()
  decimal: number;

  @Prop()
  coingeckoId: string;

  @Prop()
  blockchain: string;

  @Prop()
  approveStatus: boolean;
}

export const CoinSchema = SchemaFactory.createForClass(Coin);
