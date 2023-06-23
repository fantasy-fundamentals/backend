import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type HistoricalRatesDocument = HistoricalRates &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class HistoricalRates {
  _id?: any;

  @Prop()
  coinSymbol: string;

  @Prop()
  price: string;
}

export const HistoricalRatesSchema =
  SchemaFactory.createForClass(HistoricalRates);
