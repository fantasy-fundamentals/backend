import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsOptional
} from "class-validator";

export class CreateMintedNftBiddingDTO {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  mintedNftId: string;

  @IsNumber()
  @IsPositive()
  biddingPrice: number;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  bidderId: string;

  @IsString()
  @IsNotEmpty()
  bidderName: string;

  @IsString()
  @IsNotEmpty()
  bidderWalletAddress: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}