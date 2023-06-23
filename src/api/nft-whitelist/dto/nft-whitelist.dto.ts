import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class NftDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  telegramName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  discordName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}
