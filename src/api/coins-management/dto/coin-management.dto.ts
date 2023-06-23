import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CoinsManagementDto {
  @ApiProperty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  logo: string;

  @ApiProperty()
  launchDate: Date;

  @ApiProperty()
  chain: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty()
  contactEmail: string;

  @ApiProperty()
  contactTelegram: string;

  @ApiProperty()
  website: string;

  @ApiProperty()
  twitter: string;

  @ApiProperty()
  telegram: string;

  @ApiProperty()
  redit: string;

  @ApiProperty()
  discord: string;

  @ApiProperty()
  github: string;

  @ApiProperty()
  referralCode: string;

  @ApiProperty()
  approveStatus: boolean;
}

export class ValidateContractOwnershipDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chain: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contractAddress: string;
}

export class DeployCoinContractDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  deployedContract: object;
}

export class BlockCoinDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsBoolean()
  block: boolean;

  @ApiProperty()
  blockReason: string;
}
