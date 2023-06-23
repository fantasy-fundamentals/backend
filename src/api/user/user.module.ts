import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailHandlerModule } from 'src/api/email-handler/email-handler.module';
import { NotificationModule } from 'src/api/notification/notification.module';
import { GatewaysModule } from 'src/api/gateways/gateways.module';

@Module({
  imports: [
    ConfigModule,
    EmailHandlerModule,
    // forwardRef(() => NotificationModule),
    GatewaysModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
