import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PaypalPaymentSecretDocument = PaypalPaymentSecretEntity & Document

@Schema({ timestamps: true })
export class PaypalPaymentSecretEntity {
  @Prop({
    type: String,
    requried: true
  })
  secret: string;

  @Prop({
    type: String,
    required: true
  })
  token: string;

  @Prop({
    type: Object,
    required: true
  })
  intent: object;
}

export const PaypalPaymentSecretSchema = SchemaFactory.createForClass(
  PaypalPaymentSecretEntity,
);
