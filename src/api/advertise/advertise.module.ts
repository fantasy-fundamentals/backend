import { Module } from '@nestjs/common';
import { ResponseService } from 'src/utils/response/response.service';
import { AdvertiseController } from './advertise.controller';
import { AdvertiseService } from './advertise.service';

@Module({
  controllers: [AdvertiseController],
  providers: [AdvertiseService, ResponseService],
})
export class AdvertiseModule {}
