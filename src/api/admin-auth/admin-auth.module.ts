import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminJwtStrategy } from 'src/api/admin-auth/strategy/admin.jwt.strategy';
import { WalletModule } from 'src/api/wallet/wallet.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwt2FaStrategy } from './strategy/admin-jwt-2fa.strategy';
import { GatewaysModule } from 'src/api/gateways/gateways.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRY_TIME'),
        },
      }),
    }),
    GatewaysModule,
  ],
  providers: [AdminAuthService, AdminJwtStrategy, AdminJwt2FaStrategy],
  controllers: [AdminAuthController],
  exports: [],
})
export class AdminAuthModule {}
