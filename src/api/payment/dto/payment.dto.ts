import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CryptoPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nftId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coin: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  trx: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  systemAddress: string;
}
