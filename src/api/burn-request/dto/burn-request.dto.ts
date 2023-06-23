import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsMongoId,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
import { BurnRequestChangeableStatus } from '../burn-request-status.enum';

export class CreateBurnRequestDto {
  @ApiProperty({ name: 'nftId', type: String, required: true })
  @IsMongoId()
  nftId: string;

  @ApiProperty({ name: 'userId', type: String, required: true })
  @IsMongoId()
  userId: string;

  @ApiProperty({ name: 'nftValue', type: Number, required: true })
  @IsNumber()
  nftValue: number;

  @ApiProperty({ name: 'listingPrice', type: Number, required: true })
  @IsNumber()
  listingPrice: number;

  @ApiProperty({ name: 'walletAddress', type: String, required: true })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ name: 'quantity', type: Number, required: true })
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class ChangeBurnRequestStatusDto {
  @ApiProperty({ name: 'status', enum: BurnRequestChangeableStatus })
  @IsEnum(BurnRequestChangeableStatus)
  status: BurnRequestChangeableStatus;
}
