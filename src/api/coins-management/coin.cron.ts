import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import {
  HistoricalRates,
  HistoricalRatesDocument,
} from 'src/database/entities/historicalRates.entity';
import {
  SparkLine,
  SparklinesDocument,
} from 'src/database/entities/sparkline.entity';

import { Coin, CoinDocument } from '../../database/entities/coins.entity';
import {
  Currency,
  CurrencyDocument,
} from '../../database/entities/currency.entity';
import { Rate, RateDocument } from '../../database/entities/rates.entity';
import { RatesHelper } from './helpers/rates.helper';

@Injectable()
export class CoinCron {
  constructor(
    @InjectModel(Rate.name)
    private readonly rateModel: Model<RateDocument>,
    @InjectModel(Coin.name)
    private readonly coinModel: Model<CoinDocument>,
    @InjectModel(Currency.name)
    private readonly currencyModel: Model<CurrencyDocument>,
    @InjectModel(HistoricalRates.name)
    private readonly historicalRatesModel: Model<HistoricalRatesDocument>,

    @InjectModel(SparkLine.name)
    private readonly sparkLine: Model<SparklinesDocument>,
    private readonly ratesHelper: RatesHelper,
  ) {}

  /**
   * Cron for updating market rates from CoinGecko.
   */
  async getMarketData(coins: Coin[], currencies: Currency[]): Promise<any[]> {
    let marketData = [];
    for (const currency of currencies) {
      const _marketData = await this.ratesHelper.getMarketData(
        coins.map((c) => c.coingeckoId).join(','),
        currency.code,
      );

      marketData = [
        ...marketData,
        ..._marketData.map((data) => ({ ...data, currency: currency.code })),
      ];
    }
    return marketData;
  }

  // @Cron(CronExpression.EVERY_HOUR)
  async updateCoinRates(_coins?: Coin[]) {
    /** get supported coins */
    let coins;
    if (_coins?.length) coins = _coins;
    else coins = await this.coinModel.find().lean();

    /** get supported currencies */
    const currencies = await this.currencyModel.find().lean();

    const _marketData = await this.getMarketData(coins, currencies);

    /** get each currency and coins*/
    for (const coin of coins) {
      for (const currency of currencies) {
        try {
          /** get market data */
          let marketData;
          marketData = _marketData.find(
            (_data) =>
              _data.id === coin.coingeckoId && _data.currency === currency.code,
          );
          /** data to be updated in db */
          const rate = {
            coinSymbol: coin.coinSymbol,
            currencyCode: currency.code,
            coinId: coin._id.toString(),
            currencyId: currency._id.toString(),
            high24h: marketData.high_24h,
            low24h: marketData.low_24h,
            marketCap: marketData.market_cap,
            rate: marketData.current_price,
            totalVolume: marketData.total_volume,
            change24h: marketData.market_cap_change_24h,
            changePercentage24h: marketData.market_cap_change_percentage_24h,
            launchDate: coin.launchDate,
          };

          /** update */
          const updatedRate = await this.rateModel.findOneAndUpdate(
            { coinId: coin._id, currencyId: currency._id },
            rate,
            { upsert: true },
          );
          // await this.historicalRatesModel.create({
          //   coinSymbol: coin.coinSymbol,
          //   price: rate.rate,
          // });
        } catch (e) {
          // safely ignore
        }
      }
    }
    return;
  }

  // @Cron(CronExpression.EVERY_HOUR)
  async updateSparkLines(_coins?: Coin[]) {
    console.log('started update sparkline  job');
    /** get supported coins */
    let coins;
    if (!_coins?.length) coins = await this.coinModel.find().lean();
    else coins = _coins;

    /** get each currency and coins*/
    for (const coin of coins) {
      try {
        if (!coin.isFixedRate) {
          /**  get sparkline for evey coin and currency */
          const sparklines: any = await this.ratesHelper.getMarketChart(
            coin.coingeckoId,
            'USD',
          );

          /** update data in db*/
          const rate = {
            spark_line_1_day: sparklines.spark_line_1_day,
            spark_line_30_day: sparklines.spark_line_30_day,
            spark_line_7_day: sparklines.spark_line_7_day,
            spark_line_90_day: sparklines.spark_line_90_day,
          };

          /** update */
          await this.sparkLine.findOneAndUpdate(
            { coinSymbol: coin.coinSymbol, currencyCode: 'USD' },
            {
              ...rate,
              coinSymbol: coin.coinSymbol,
              currencyCode: 'USD',
            },
            { upsert: true },
          );
        } else {
          const spark_line_1_day = await this.ratesHelper.fixedAssetSparkline(
            coin,
            1,
          );
          const spark_line_7_day = await this.ratesHelper.fixedAssetSparkline(
            coin,
            7,
          );
          const spark_line_30_day = await this.ratesHelper.fixedAssetSparkline(
            coin,
            30,
          );
          const spark_line_90_day = await this.ratesHelper.fixedAssetSparkline(
            coin,
            90,
          );
          await this.sparkLine.findOneAndUpdate(
            { coinId: coin._id, currencyCode: 'USD' },
            {
              spark_line_1_day,
              spark_line_7_day,
              spark_line_30_day,
              spark_line_90_day,
            },
            { upsert: true },
          );
        }
      } catch (e) {
        // safely ignore
      }
    }
    return;
  }
}
