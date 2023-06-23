import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsPositive,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateNftDTO {
  @ApiProperty({ name: 'videoUrl', required: false, type: String })
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ name: 'value', required: false, type: Number })
  @IsNumber()
  @IsPositive()
  value?: number;
}

export class BurnNftDTO {
  @ApiProperty({ name: 'value', required: false, type: Number })
  @IsNumber()
  @IsPositive()
  quantity?: number;
}

export class NftOwnershipTransferDto {
  @ApiProperty({ required: true, type: String })
  @IsString()
  @IsNotEmpty()
  nftId: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  @IsNotEmpty()
  ownerAddress: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  @IsNotEmpty()
  buyerAddress: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  @IsNotEmpty()
  blockChainNftId: string;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  @IsPositive()
  quantity: number;
}
