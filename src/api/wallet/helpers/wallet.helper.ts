import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  WalletEntity,
  WalletDocument,
} from '../../../database/entities/wallet.entity';
import { Model } from 'mongoose';
import { Web3Service } from '../../web3/web3.service';
const Web3 = require('web3');

@Injectable()
export class WalletHelper {
  constructor(
    @InjectModel(WalletEntity.name)
    private readonly walletModel: Model<WalletDocument>,
    private readonly web3Service: Web3Service,
  ) {}
}
