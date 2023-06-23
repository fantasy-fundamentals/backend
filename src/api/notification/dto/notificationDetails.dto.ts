import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NotificationDetailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requestId: string;
}
