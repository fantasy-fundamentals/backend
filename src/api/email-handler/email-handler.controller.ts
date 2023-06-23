import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('email')
@Controller('emailHandler')
export class EmailHandlerController {}
