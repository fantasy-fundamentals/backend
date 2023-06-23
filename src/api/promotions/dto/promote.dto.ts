import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { PROMOTION_STATUS, PROMOTION_TYPE } from 'src/utils/misc/enum';

export class PromoteDto {
  @ApiProperty()
  @IsString()
  type: PROMOTION_TYPE;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  dates: [];

  @ApiProperty()
  mediaUrl?: string;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  paymentTransaction: object;

  @ApiProperty()
  coinSymbol?: string;

  @ApiProperty()
  externalLink?: string;
}

export class ApprovePromotionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: PROMOTION_STATUS;
}

export class ValidateDate {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class ValidateMonth {
  @ApiProperty({
    example: '2022-10',
  })
  @IsString()
  @IsNotEmpty()
  month: string;

  @ApiProperty({
    example: 'banner',
  })
  @IsString()
  @IsNotEmpty()
  type: string;
}

ValidateMonth;
