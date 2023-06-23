import {
  BadRequestException,
  Injectable,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  CoinManagemnetDocument,
  CoinManagemnetEntity,
} from 'src/database/entities/coin-managemnet.entity';
import { Coin, CoinDocument } from 'src/database/entities/coins.entity';
import { Rate, RateDocument } from 'src/database/entities/rates.entity';
import {
  SparkLine,
  SparklinesDocument,
} from 'src/database/entities/sparkline.entity';
import {
  WatchListDocument,
  WatchListEntity,
} from 'src/database/entities/watchList.entity';
import { Web3Service } from '../web3/web3.service';
import {
  CoinsManagementDto,
  ValidateContractOwnershipDto,
} from './dto/coin-management.dto';

@Injectable()
export class CoinsManagementService {
  constructor(
    @InjectModel(CoinManagemnetEntity.name)
    private readonly coinModal: Model<CoinManagemnetDocument>,

    @InjectModel(Coin.name)
    private readonly coin: Model<CoinDocument>,

    @InjectModel(Rate.name)
    private readonly coinRate: Model<RateDocument>,

    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service,

    @InjectModel(SparkLine.name)
    private readonly sparklineModel: Model<SparklinesDocument>,

    @InjectModel(WatchListEntity.name)
    private readonly watchListModel: Model<WatchListDocument>,
  ) {}

  // add coin
  async addCoin(coin): Promise<object> {
    let newCoin = {
      name: coin.name,
      coinSymbol: coin.symbol,
      icon: { url: coin.logo, key: '' },
      approveStatus: coin.approveStatus,
      coingeckoId: coin.coingeckoId,
    };
    const found = await this.coinModal.find({ symbol: coin.symbol });

    if (found.length > 0) {
      throw new BadRequestException(`${coin.symbol} already exits`);
    }
    const _coin = await this.coin.create(newCoin);
    coin.coin = _coin;
    await this.coinModal.create(coin);
    return {
      status: 201,
      message: 'Coin successfully added',
    };
  }
  // get all coins
  async getAllCoin({ todaysHot, launchDate, marketCap, walletAddress }) {
    try {
      const coins = await this.coinModal.find({
        approveStatus: true,
        block: false,
      });

      let response = [];
      for (let coin of coins) {
        const rate = await this.coinRate
          .findOne({ currencyCode: 'USD', coinSymbol: coin.symbol })
          .sort(
            todaysHot
              ? { changePercentage24h: todaysHot === 'true' ? -1 : 1 }
              : launchDate
              ? { launchDate: launchDate === 'true' ? 1 : -1 }
              : { marketCap: marketCap === 'true' ? -1 : 1 },
          );

        if (walletAddress) {
          let favorite = await this.watchListModel.findOne({
            coinId: String(coin._id),
            walletAddress,
          });
          coin.favorite = favorite ? true : false;
        }

        response.push({
          ...rate?.toJSON(),
          ...coin?.toJSON(),
        });
      }
      return response;
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getAllCoinAdmin() {
    try {
      const coins = await this.coinModal.find();

      let response = [];
      for (let coin of coins) {
        const rate = await this.coinRate.findOne({
          coinSymbol: coin.symbol,
        });
        response.push({
          ...rate?.toJSON(),
          ...coin?.toJSON(),
        });
      }
      return response;
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getAllContractCoins() {
    try {
      return await this.coinModal.find({ deployed: true });
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getAllCoinUser(userAddress, watchlist) {
    try {
      if (watchlist === 'true') {
        const watchlists = await this.watchListModel.find({
          walletAddress: userAddress,
        });

        let response = [];
        for (let watchlist of watchlists) {
          const rate = await this.coinRate.findOne({
            // @ts-ignore
            coinSymbol: watchlist.coin.symbol,
          });

          const historicalRate = await this.sparklineModel.find({
            // @ts-ignore
            coingSymbol: watchlist.coin.symbol,
          });
          response.push({
            ...rate?.toJSON(),
            ...watchlist?.toJSON(),
            historicalRate,
          });
        }
        return response;
      } else {
        const coins = await this.coinModal.find({
          userAddress,
          approveStatus: true,
          block: false,
        });

        let response = [];
        for (let coin of coins) {
          const rate = await this.coinRate.findOne({
            coinSymbol: coin.symbol,
          });

          const historicalRate = await this.sparklineModel.find({
            coingSymbol: coin.symbol,
          });
          response.push({
            ...rate?.toJSON(),
            ...coin?.toJSON(),
            historicalRate,
          });
        }
        return response;
      }
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getUserCoin(coinSymbol) {
    try {
      const coins = await this.coinModal.find({ symbol: coinSymbol });

      let response = [];
      for (let coin of coins) {
        const rate = await this.coinRate.findOne({
          coinSymbol: coin.symbol,
        });

        const historicalRate = await this.sparklineModel.findOne({
          coinSymbol: coin.symbol,
        });
        response.push({
          ...rate?.toJSON(),
          ...coin?.toJSON(),
          historicalRate,
        });
      }
      return response;
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  // update coin
  async updateCoin(coinId: string, coin: CoinsManagementDto): Promise<object> {
    try {
      await this.coinModal.findByIdAndUpdate(coinId, coin);
      const updateData = await this.coinModal.findById(coinId);
      return updateData;
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
  // delete coin
  async deleteCoin(coinId: string): Promise<object> {
    try {
      const findCoin = await this.coinModal.findOne({ _id: coinId });

      await this.coinModal.findByIdAndDelete(coinId);
      return {
        status: 201,
        message: 'Coin deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        `Cound not find coin against this ID ${coinId}`,
        '400',
      );
    }
  }

  //approve coin
  async approveCoin(approveCoin): Promise<object> {
    let { id, status } = approveCoin;

    try {
      await this.coinModal.findByIdAndUpdate(id, { approveStatus: status });
      return {
        status: 201,
        message: 'Coin Approve status changed successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async block(payload): Promise<object> {
    let { id, block, blockReason } = payload;

    try {
      await this.coinModal.findByIdAndUpdate(id, {
        block,
        blockReason,
      });

      return {
        message: `Coin has been ${
          block ? 'blocked' : 'unblocked'
        } successfully!`,
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async validateContractOwnership(payload: ValidateContractOwnershipDto) {
    try {
      return await this.web3Service.valdiateAddress(payload);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deployCoinContract(payload): Promise<object> {
    let { symbol, deployedContract } = payload;

    console.log(payload);

    try {
      await this.coinModal.findOneAndUpdate(
        {
          symbol,
        },
        {
          deployedContract,
          deployed: true,
        },
      );
      return {
        status: 201,
        message: 'Contract deployed successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async updateBalance(coinSymbl, amount) {
    try {
      return await this.coinModal.findOneAndUpdate(
        { symbol: coinSymbl },
        {
          $inc: { votes: amount },
        },
      );
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
