import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class GetUserDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;
}
