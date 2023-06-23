import { Module } from '@nestjs/common';
import { MailChimpService } from 'src/utils/mailchimp.service';
import { GatewaysModule } from '../gateways/gateways.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [GatewaysModule],
  controllers: [SettingsController],
  providers: [SettingsService, MailChimpService],
})
export class SettingsModule {}
