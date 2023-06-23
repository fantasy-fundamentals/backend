import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { FILE_TYPE } from 'src/utils/misc/enum';

export class SignatureDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: FILE_TYPE;

  @ApiProperty()
  @IsNotEmpty()
  file: any;
}
