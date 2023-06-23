import { HttpModule, HttpService, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { Web3Module } from '../web3/web3.module';
import { CoinCron } from './coin.cron';
import { CoinsManagementController } from './coins-management.controller';
import { CoinsManagementService } from './coins-management.service';
import { RatesHelper } from './helpers/rates.helper';
const CoinGecko = require('coingecko-api');

@Module({
  imports: [
    HttpModule,
    MulterModule.register({
      dest: './upload',
    }),
    Web3Module,
  ],

  controllers: [CoinsManagementController],
  providers: [
    CoinsManagementService,
    CoinCron,
    RatesHelper,
    {
      provide: 'CoinGeckoClient',
      useValue: new CoinGecko(),
    },
  ],
})
export class CoinsManagementModule {}
