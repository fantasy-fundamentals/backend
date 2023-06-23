import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coin: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  to: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: string;
}
