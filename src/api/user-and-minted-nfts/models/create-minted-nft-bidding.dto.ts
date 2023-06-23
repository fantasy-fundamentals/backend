import {
  IsNumber,
  IsPositive,
  IsBoolean,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsMongoId
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateMintedNftBiddingDTO {
  @ApiProperty({ required: true, name: 'biddingPrice', type: Number })
  @IsNumber()
  @IsPositive()
  biddingPrice: number;

  @ApiProperty({ required: true, name: 'bidderName', type: String })
  @IsString()
  @IsNotEmpty()
  bidderName: string;

  @ApiProperty({ required: true, name: 'bidderEmail', type: String })
  @IsString()
  @IsNotEmpty()
  bidderEmail: string;

  @ApiProperty({ required: true, name: 'bidderId', type: String })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  bidderId: string;

  @ApiProperty({ required: true, name: 'bidderWalletAddress', type: String })
  @IsString()
  @IsNotEmpty()
  bidderWalletAddress: string;

  @ApiProperty({ required: false, name: 'isActive', type: Boolean })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}