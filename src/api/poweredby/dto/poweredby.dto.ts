import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { POWERED_BY } from 'src/utils/misc/enum';

export class PoweredByDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: POWERED_BY;

  @ApiProperty()
  link?: string;

  @ApiProperty()
  mediaLink: string;
}
