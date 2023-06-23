import { Module } from '@nestjs/common';
import { ContactUsController } from './contactUs.controller';
import { ContactUsService } from './contactUs.service';
import { EmailHandlerModule } from '../email-handler/email-handler.module';

@Module({
  imports: [EmailHandlerModule],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
