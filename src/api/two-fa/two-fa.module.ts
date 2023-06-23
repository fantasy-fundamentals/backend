import { Module } from '@nestjs/common';
import { TwoFaController } from './two-fa.controller';
import { TwoFaService } from './two-fa.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { EmailHandlerModule } from '../email-handler/email-handler.module';

@Module({
  imports: [ConfigModule, AuthModule, EmailHandlerModule],
  controllers: [TwoFaController],
  providers: [TwoFaService],
})
export class TwoFaModule { }
