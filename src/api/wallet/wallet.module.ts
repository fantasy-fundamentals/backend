import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from 'src/api/settings/settings.module';
import { Web3Module } from '../web3/web3.module';
import { WalletHelper } from './helpers/wallet.helper';
import { WalletCore } from './wallet-core.service';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [Web3Module, ConfigModule],
  controllers: [WalletController],
  providers: [WalletService, WalletCore, WalletHelper],
  exports: [WalletService, WalletHelper],
})
export class WalletModule {}
