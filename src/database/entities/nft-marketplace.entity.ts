import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserEntity } from './user.entity';

interface IBidding {
  bidderId: string;
  bidderName: string;
  biddingPrice: string;
}

export type NFTMarketplaceDocument = NFTMarketplaceEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class NFTMarketplaceEntity {
  _id?: any;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UserEntity',
    required: true,
  })
  seller: UserEntity;

  @Prop({ type: String, required: true })
  ownerWalletAddress: string;

  @Prop({ type: Object, requried: true })
  nftMetadata: object;

  @Prop({ type: Boolean, default: true, required: false })
  status: boolean;

  @Prop({ type: Array, default: [], requried: false })
  bidding: IBidding[]
}

export const NFTMarketplaceSchema =
  SchemaFactory.createForClass(NFTMarketplaceEntity);
