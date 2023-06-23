import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Coin } from './coins.schema';
// import { Currency } from './currency.schema';

export type RateDocument = Rate &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class Rate {
  _id?: any;

  @Prop()
  coinId: string;

  @Prop()
  currencyId: string;

  @Prop()
  rate: number;

  @Prop()
  marketCap: number;

  @Prop()
  totalVolume: number;

  @Prop()
  low24h: number;

  @Prop()
  high24h: number;

  @Prop()
  networkFeeMin: number;

  @Prop()
  networkFeeMax: number;

  @Prop()
  networkFeeAvg: number;

  @Prop()
  coinSymbol: string;

  @Prop()
  currencyCode: string;

  @Prop()
  change24h: number;

  @Prop()
  changePercentage24h: number;

  @Prop()
  launchDate: Date;
}

export const RateSchema = SchemaFactory.createForClass(Rate);
