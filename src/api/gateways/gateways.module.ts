import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewaysController } from './gateways.controller';
import { GatewaysService } from './gateways.service';

@Module({
  imports: [ConfigModule],
  controllers: [GatewaysController],
  providers: [GatewaysService],
  exports: [GatewaysService],
})
export class GatewaysModule {}
