import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WatchListDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coinId: string;
}
