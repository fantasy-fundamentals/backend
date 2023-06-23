import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TwoFaCodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  twoFaCode: string;
}
