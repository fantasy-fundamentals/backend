import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TransactionLog,
  TransactionLogDocument,
} from 'src/database/entities/transactionsLog.entity';
var ObjectId = require('mongodb').ObjectId;

@Injectable()
export class TransactionLogService {
  constructor(
    @InjectModel(TransactionLog.name)
    private readonly transactionLogModal: Model<TransactionLogDocument>,
  ) {
    // var nftId = new ObjectId('63b3d9e94d69b2746970b47b');
    // var userId = new ObjectId('63e6261ed488f7d9f9c1a65e');
    // console.log(userId);
    // this.create({
    //   type: TRANSACTION_LOG.mint,
    //   amount: '30',
    //   user: userId,
    //   nft: nftId,
    // });
    // this.get('63e6261ed488f7d9f9c1a65e');
  }

  async create(payload): Promise<object> {
    try {
      return await this.transactionLogModal.create(payload);
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async get(userId: string) {
    let user = new ObjectId(userId);
    try {
      return await this.transactionLogModal.find({ user }).populate('nft');
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async adminGetAll() {
    try {
      return await this.transactionLogModal.find().populate(['user', 'nft']);
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
