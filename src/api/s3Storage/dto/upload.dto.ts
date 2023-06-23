import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FILE_TYPE } from 'src/utils/misc/enum';

export class UploadDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: FILE_TYPE;
}
