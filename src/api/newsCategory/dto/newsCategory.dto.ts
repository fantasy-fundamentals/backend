import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NewsCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}
