import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ChangeNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
