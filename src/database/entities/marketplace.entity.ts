import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Partner_Type } from 'src/utils/misc/enum';

export class SocialLinksDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  link: string;
}

export class SocialPlatformsDto {
  @ApiProperty({
    example: 'Facebook',
  })
  platform: string;
}

export type MarketplaceDocument = Marketplace &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class Marketplace {
  _id?: any;

  @Prop()
  title: string;

  @Prop()
  coverImg: string;

  @Prop()
  description: string;

  @Prop()
  orders: number;

  @Prop()
  successRatePercentage: number;

  @Prop({ type: String })
  partnerType: Partner_Type;

  @Prop()
  votes: number;

  @Prop({ type: Array })
  socialPlatforms: SocialPlatformsDto[];

  @Prop({ type: Array })
  socialLinks: SocialLinksDto;

  @Prop()
  priceRangeMin: number;

  @Prop()
  priceRangeMax: number;

  @Prop()
  paymentCoin: string;

  @Prop()
  plans: PlanDto[];

  @Prop({ default: true })
  status: boolean;
}

export class PlanDto {
  @ApiProperty()
  itemName: string;

  @ApiProperty()
  platform: string;

  @ApiProperty()
  details: string;

  @ApiProperty()
  price: string;

  @ApiProperty()
  coin: string;

  @ApiProperty({ default: true })
  status: boolean;
}

export const MarketplaceSchema = SchemaFactory.createForClass(Marketplace);
