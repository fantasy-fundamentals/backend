import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SettingsDto {
  @ApiProperty()
  @IsOptional()
  privacyPolicy?: string;
}
