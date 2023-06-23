import { Module } from '@nestjs/common';
import { PoweredByController } from './poweredby.controller';
import { PoweredByService } from './poweredby.service';

@Module({
  controllers: [PoweredByController],
  providers: [PoweredByService],
})
export class PoweredByModule {}
