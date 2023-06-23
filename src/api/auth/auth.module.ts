import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Jwt2FaStrategy } from './strategy/jwt-2fa.strategy';
import { EmailHandlerModule } from 'src/api/email-handler/email-handler.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
    EmailHandlerModule,
  ],
  providers: [AuthService, JwtStrategy, Jwt2FaStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
