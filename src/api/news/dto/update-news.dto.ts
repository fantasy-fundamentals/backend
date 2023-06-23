import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNewsDTO {
  @ApiProperty({ name: 'coverImage', required: true, type: String })
  @IsString()
  coverImage: string;

  @IsOptional()
  slug?: string;
}
