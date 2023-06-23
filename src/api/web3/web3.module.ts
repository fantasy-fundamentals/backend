import { Module } from '@nestjs/common';
import { Web3Controller } from './web3.controller';
import { Web3Service } from './web3.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
const Web3 = require('web3');

@Module({
  imports: [ConfigModule],
  controllers: [Web3Controller],
  providers: [
    Web3Service,
    {
      provide: 'BscWeb3',
      useFactory: (config: ConfigService) => {
        return new Web3(
          new Web3.providers.HttpProvider(config.get('BSC_RPC_URL')),
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'EthWeb3',
      useFactory: (config: ConfigService) => {
        return new Web3(
          new Web3.providers.HttpProvider(config.get('ETH_RPC_URL')),
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [Web3Service],
})
export class Web3Module {}
