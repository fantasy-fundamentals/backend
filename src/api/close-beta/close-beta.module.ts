import { Module } from '@nestjs/common';
import { CloseBetaController } from './close-beta.controller';
import { CloseBetaService } from './close-beta.service';

@Module({
  controllers: [CloseBetaController],
  providers: [CloseBetaService],
})
export class CloseBetaModule {}
