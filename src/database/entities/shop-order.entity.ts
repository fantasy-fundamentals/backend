import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';
import { PaymentType } from 'src/shared/enums/payment-types.enum';
import { PaymentMethod } from 'src/shared/enums/payment-methods.enum';
import { OrderStatus } from 'src/api/shop-orders/models/shop-order-status.enum';
@Schema({ timestamps: true })
export class ShopOrderEntity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UserEntity',
    required: true
  })
  userId: string;

  @Prop({
    type: String,
    required: false
  })
  walletAddress: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ShopEntity',
    required: true
  })
  productId: string;

  @Prop({
    type: String,
    required: false
  })
  productSize?: string;

  @Prop({
    type: Number,
    required: true
  })
  productPrice: number;

  @Prop({
    type: String,
    required: true
  })
  productTitle: string;

  @Prop({
    type: Boolean,
    required: true
  })
  productVariantBought: boolean;

  @Prop({
    type: String,
    enum: PaymentType,
    required: true
  })
  paymentType: string;

  @Prop({
    type: String,
    required: true
  })
  transactionNumberOrHash: string;

  @Prop({
    type: Number,
    required: false
  })
  amount: number;

  @Prop({
    type: String,
    required: false
  })
  secret: string;

  @Prop({
    type: String,
    enum: PaymentMethod,
    required: true
  })
  paymentMethod: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false
  })
  needsToBeRefunded: boolean;

  @Prop({
    type: String,
    enum: OrderStatus,
    required: false,
    default: OrderStatus.Pending
  })
  status: string
}

export type ShopOrderDocument = Document & ShopOrderEntity;
export const ShopOrderSchema = SchemaFactory.createForClass(ShopOrderEntity)