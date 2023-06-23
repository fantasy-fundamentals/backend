import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';
import { PaymentType } from 'src/shared/enums/payment-types.enum';
import { PaymentMethod } from 'src/shared/enums/payment-methods.enum';
import { OrderStatus } from 'src/api/nft-orders/models/nft-order-status.enum';

@Schema({ timestamps: true })
export class NftOrderEntity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UserEntity',
    required: true
  })
  userId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'NftEntity'
  })
  nftId: string;

  @Prop({
    type: String,
    required: false
  })
  walletAddress: string;

  @Prop({
    type: Number,
    required: true
  })
  countOfNftToMint: number;

  @Prop({
    type: String,
    enum: PaymentType,
    requried: true
  })
  paymentType: string;

  @Prop({
    type: String,
    required: false
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
    required: false
  })
  paymentMethod: string;

  @Prop({
    type: String,
    enum: OrderStatus,
    required: false,
    default: OrderStatus.Pending
  })
  status: string
}

export type NftOrderDocument = Document & NftOrderEntity;
export const NftOrderSchema = SchemaFactory.createForClass(NftOrderEntity)