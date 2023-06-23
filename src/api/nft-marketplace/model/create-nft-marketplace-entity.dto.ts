import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsObject,
  IsNotEmptyObject
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateNFTMarketplaceEntityDTO {
  @ApiProperty({ type: String, name: 'sellerId', required: true })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  sellerId: string;

  @ApiProperty({ type: String, name: 'ownerWalletAddress', required: true })
  @IsString()
  @IsNotEmpty()
  ownerWalletAddress: string;

  @ApiProperty({ type: Object, name: 'nftMetadata', required: true })
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => Object)
  nftMetadata: object;
}