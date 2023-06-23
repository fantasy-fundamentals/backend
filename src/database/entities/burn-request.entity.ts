import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BurnRequestStatus } from 'src/api/burn-request/burn-request-status.enum';

export type BurnRequestDocument = BurnRequestEntity & Document;

@Schema({ timestamps: true })
export class BurnRequestEntity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'UserEntity',
  })
  nftId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'NftEntity',
  })
  userId: string;

  @Prop({
    type: Number,
    required: true,
  })
  nftValue: number;

  @Prop({
    type: Number,
    required: true,
  })
  listingPrice: number;

  @Prop({
    enum: BurnRequestStatus,
    default: BurnRequestStatus.Pending,
  })
  status: BurnRequestStatus;

  @Prop({
    type: String,
    required: true,
  })
  walletAddress: string;

  @Prop({
    type: Number,
    required: true,
  })
  quantity: number;
}

export const BurnRequestSchema =
  SchemaFactory.createForClass(BurnRequestEntity);
