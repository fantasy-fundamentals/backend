import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlayerValueDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  value: number;
}
