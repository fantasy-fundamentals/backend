import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type NftWhitelistDocument = NftWhitelistEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class NftWhitelistEntity {
  _id?: any;

  @Prop()
  discordName: string;

  @Prop()
  telegramName: string;

  @Prop()
  walletAddress: string;
}

export const NftWhitelistSchema =
  SchemaFactory.createForClass(NftWhitelistEntity);
