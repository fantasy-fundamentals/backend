import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CoinManagemnetDocument,
  CoinManagemnetEntity,
} from 'src/database/entities/coin-managemnet.entity';
import {
  WatchListDocument,
  WatchListEntity,
} from 'src/database/entities/watchList.entity';

@Injectable()
export class WatchListService {
  constructor(
    @InjectModel(WatchListEntity.name)
    private readonly WatchListModel: Model<WatchListDocument>,

    @InjectModel(CoinManagemnetEntity.name)
    private readonly coinModal: Model<CoinManagemnetDocument>,
  ) {}

  async create(payload): Promise<object> {
    try {
      let coin = await this.coinModal.findById(payload.coinId);
      payload.coin = coin;
      let watchList = await this.WatchListModel.findOne({
        coinId: payload.coinId,
        walletAddress: payload.walletAddress,
      });
      if (!watchList) {
        await this.WatchListModel.create(payload);
        return {
          status: 201,
          message: 'Watchlist created successfully',
        };
      } else {
        await this.WatchListModel.deleteOne({
          coinId: payload.coinId,
          walletAddress: payload.walletAddress,
        });
        return {
          status: 201,
          message: 'Coin removed from watchlist',
        };
      }
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async get(walletAddress): Promise<WatchListDocument[]> {
    try {
      return await this.WatchListModel.find({ walletAddress });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Internal Server Error');
    }
  }

  async update({ walletAddress, coinId }): Promise<Object> {
    try {
      await this.WatchListModel.findByIdAndUpdate(walletAddress, coinId);
      return {
        status: 201,
        message: 'Watchlist updated successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async delete({ walletAddress, coinId }): Promise<Object> {
    try {
      const found = await this.WatchListModel.findById({
        walletAddress,
        coinId,
      });
      if (!found) {
        throw new BadRequestException('Watchlist not found');
      }
      await this.WatchListModel.findByIdAndDelete({ walletAddress, coinId });
      return {
        status: 201,
        message: 'Watchlist deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
