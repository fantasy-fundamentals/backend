import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EXTERNAL_WALLETS_TYPE } from 'src/utils/misc/enum';
import * as mongoose from 'mongoose';
import {
  ExternalWalletDocument,
  ExternalWalletEntity,
} from 'src/database/entities/externalWallet.entity ';
import { ExternalWalletInterface } from './dto/externalWallet.dto';

@Injectable()
export class ExternalWalletService {
  constructor(
    @InjectModel(ExternalWalletEntity.name)
    private readonly systemWallet: Model<ExternalWalletDocument>,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async get() {
    return await this.systemWallet.find();
  }

  async create(wallets: ExternalWalletInterface[]) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      let w = {};

      for (let index = 0; index < wallets.length; index++) {
        let e: ExternalWalletInterface = wallets[index];
        let payload = {
          ...e,
        };

        w[e.type] = await this.systemWallet.findOneAndUpdate(
          {
            type: e.type,
          },
          payload,
          { upsert: true, new: true },
        );
      }

      await session.commitTransaction();
      await session.endSession();

      return w;
    } catch (err) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    }
  }
}
