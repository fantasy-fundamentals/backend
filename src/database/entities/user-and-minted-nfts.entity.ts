import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NftEntity } from './nft.entity';

export type UserAndMintedNftDocument = UserAndMintedNftEntity & Document;

@Schema({ timestamps: true })
export class UserAndMintedNftEntity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'UserEntity',
  })
  userId: string;

  @Prop({
    type: Array,
    required: false,
  })
  mintedIds: [{ quantity: number; id: string }];

  @Prop({
    type: String,
    required: true,
  })
  walletAddress: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'NftEntity',
    required: true,
  })
  nftId: NftEntity;

  @Prop({
    type: Number,
    required: false,
    default: 1,
  })
  count: number;

  @Prop({
    type: Number,
    required: false,
    default: 1,
  })
  available: number;

  @Prop({
    type: Number,
    required: false,
    default: 0,
  })
  listingCount: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  isPurchased: boolean;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  activeMarketplace: boolean;

  @Prop({
    type: Number,
    required: false,
    default: 0,
  })
  listingPrice: number;
}

export const UserAndMintedNftSchema = SchemaFactory.createForClass(
  UserAndMintedNftEntity,
);
