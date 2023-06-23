import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminImportService } from './admin-import.service';

@ApiTags('admin-import')
@Controller('admin-import')
export class AdminImportController {
  constructor(private readonly adminImportService: AdminImportService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('/import-odds')
  async adminImport(@UploadedFile() file: Express.Multer.File) {
    return await this.adminImportService.import(file);
  }

  @ApiOperation({ summary: 'Get all import data' })
  @Get('/get-odds')
  async get() {
    return await this.adminImportService.getAll();
  }
}
