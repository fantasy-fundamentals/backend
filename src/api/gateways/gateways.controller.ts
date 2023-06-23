import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('gateways')
@Controller('gateways')
export class GatewaysController {}
