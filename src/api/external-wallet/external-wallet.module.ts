import { Module } from '@nestjs/common';
import { Encryption } from 'src/utils/encryption';
import { ExternalWalletController } from './external-wallet.controller';
import { ExternalWalletService } from './external-wallet.service';

@Module({
  imports: [],
  controllers: [ExternalWalletController],
  providers: [ExternalWalletService, Encryption],
  exports: [ExternalWalletService],
})
export class ExternalWalletModule {}
