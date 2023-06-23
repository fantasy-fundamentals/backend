import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailHandlerController } from './email-handler.controller';
import { EmailHandlerService } from './email-handler.service';

@Module({
  imports: [ConfigModule],
  controllers: [EmailHandlerController],
  providers: [EmailHandlerService],
  exports: [EmailHandlerService],
})
export class EmailHandlerModule {}
