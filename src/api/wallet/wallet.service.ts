import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity, UserDocument } from 'src/database/entities/user.entity';
import {
  WalletEntity,
  WalletDocument,
} from 'src/database/entities/wallet.entity';
import { SettingsService } from 'src/api/settings/settings.service';
import { Readable } from 'stream';
import { Web3Service } from '../web3/web3.service';
import { WalletHelper } from './helpers/wallet.helper';
import { WalletCore } from './wallet-core.service';
const XLSX = require('xlsx');

@Injectable()
export class WalletService {
  constructor(
    private readonly walletCore: WalletCore,
    @InjectModel(WalletEntity.name)
    private readonly walletModel: Model<WalletDocument>,
    private readonly web3Service: Web3Service,
    private readonly walletHelper: WalletHelper,
    private readonly settingsService: SettingsService,
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getUserWallets(user: UserEntity) {
    return await this.walletModel.find({ userEmail: user.email });
  }

  async getUserWalletBySymbol(user: UserEntity, coinSymbol: string) {
    return await this.walletModel
      .findOne({ userEmail: user.email, coinSymbol })
      .lean();
  }

  async getUserWalletById(walletId: string) {
    return await this.walletModel.findOne({ _id: walletId }).lean();
  }

  async getAllWallets() {
    return await this.walletModel.find().populate('userId');
  }

  async getUserBNBWalletByEmail(email: string) {
    return await this.walletModel.findOne({
      userEmail: email,
      coinSymbol: 'bnb',
    });
  }

  bufferToStream(buffer) {
    let stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}
