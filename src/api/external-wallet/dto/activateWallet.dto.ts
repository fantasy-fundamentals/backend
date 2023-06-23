import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateWalletDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coinSymbol: string;
}
