import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BlockUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isblocked: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reasonToBlock?: string;
}
