import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import {
  PlanDto,
  SocialLinksDto,
  SocialPlatformsDto,
} from 'src/database/entities/marketplace.entity';
import { Partner_Type } from 'src/utils/misc/enum';

export class MarketplaceDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  coverImg: string;

  @ApiProperty()
  orders: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  successRatePercentage: number;

  @ApiProperty()
  partnerType: Partner_Type;

  @ApiProperty({
    isArray: true,
    type: SocialPlatformsDto,
  })
  socialPlatforms: SocialPlatformsDto[];

  @ApiProperty({
    isArray: true,
    type: SocialLinksDto,
  })
  socialLinks: SocialLinksDto[];

  @ApiProperty()
  priceRangeMin: number;

  @ApiProperty()
  priceRangeMax: number;

  @ApiProperty()
  paymentCoin: string;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => PlanDto)
  plans: [PlanDto];
}
