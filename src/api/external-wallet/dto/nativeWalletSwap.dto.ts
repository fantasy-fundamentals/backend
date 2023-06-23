import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NativeWalletSwapDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coinSymbol: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: string;
}
