import {
  Body,
  Controller,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadDto } from './dto/upload.dto';
import { S3StorageService } from './s3Storage.service';

@ApiTags('storage')
@Controller('storage')
export class S3StorageController {
  constructor(private readonly s3Storage: S3StorageService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadPayload: UploadDto,
    @Req() { user },
  ) {
    try {
      return this.s3Storage.uploadPublicFile(uploadPayload.type, user, file);
    } catch (error) {
      console.log(JSON.stringify(error, undefined, 4));
    }
  }
}
