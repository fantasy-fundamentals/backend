import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

@Schema({ timestamps: true })
export class MintedNftBiddingEntity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UserAndMintedNftEntity',
    required: true
  })
  mintedNftId: string;

  @Prop({
    type: String,
    required: true
  })
  bidderName: string;

  @Prop({
    type: String,
    required: true
  })
  bidderEmail: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UserEntity',
    required: true
  })
  bidderId: string;

  @Prop({
    type: String,
    required: true
  })
  bidderWalletAddress: string;

  @Prop({
    type: Number,
    required: true
  })
  biddingPrice: number;

  @Prop({
    type: Boolean,
    required: false,
    default: true
  })
  isActive: boolean;
}

export const MintedNftBiddingSchema = SchemaFactory.createForClass(MintedNftBiddingEntity);
export type MintedNftBiddingDocument = Document & MintedNftBiddingEntity;