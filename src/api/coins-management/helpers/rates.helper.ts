import { HttpService, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import moment from 'moment';
import { CoinGeckoMarketDataInterface } from '../interfaces/coingecko-market-data.interface';

@Injectable()
export class RatesHelper {
  constructor(
    @Inject('CoinGeckoClient')
    private readonly coinGeckoClient,

    private readonly http: HttpService,
  ) {}

  async getMarketData(
    coinIds: string,
    currencyCode: string,
  ): Promise<CoinGeckoMarketDataInterface[]> {
    try {
      const data = await this.coinGeckoClient.coins.markets({
        vs_currency: currencyCode,
        ids: coinIds,
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h',
      });

      if (data.success) return data.data;
    } catch (err) {
      throw new Error("couldn't get market data");
    }
  }

  async getCurrentGasPrices() {
    try {
      const response = await axios.get(
        'https://ethgasstation.info/json/ethgasAPI.json',
      );
      const prices = {
        low: response.data.safeLow / 10,
        medium: response.data.average / 10,
        high: response.data.fast / 10,
      };
      return prices;
    } catch (e) {
      console.log('Error getting current gas prices ', e);
    }
  }

  async getBinanceCurrentGasPrices() {
    try {
      const response = await axios.get(
        'https://bscgas.info/gas?apikey=a57f876b08a7462db84287147fee5b85',
      );
      const prices = {
        low: response.data?.slow / 10,
        medium: response.data?.standard / 10,
        high: response.data?.fast / 10,
      };
      return prices;
    } catch (e) {}
  }

  async erc20NetworkFee() {
    const gasPrices = await this.getCurrentGasPrices();

    const networkFeeMin = parseFloat(
      ((21000 * gasPrices.low) / 1e9).toFixed(8),
    );
    const networkFeeAvg = parseFloat(
      ((21000 * gasPrices.medium) / 1e9).toFixed(8),
    );
    const networkFeeMax = parseFloat(
      ((21000 * gasPrices.high) / 1e9).toFixed(8),
    );

    return { networkFeeMin, networkFeeMax, networkFeeAvg };
  }

  async binanceNetworkFee() {
    const gasPrices = await this.getBinanceCurrentGasPrices();

    const networkFeeMin = parseFloat(
      ((21000 * gasPrices.low) / 1e9).toFixed(8),
    );
    const networkFeeAvg = parseFloat(
      ((21000 * gasPrices.medium) / 1e9).toFixed(8),
    );
    const networkFeeMax = parseFloat(
      ((21000 * gasPrices.high) / 1e9).toFixed(8),
    );

    return { networkFeeMin, networkFeeMax, networkFeeAvg };
  }

  blockcyperNetwork(symbol) {
    if (process.env.NODE_ENV === 'development') {
      return 'btc/test3';
    } else {
      return symbol + '/main';
    }
  }

  buildBlockcypherApiUrl(coin, endpoint) {
    return `${process.env.BLOCKCYPHER_URL}/${
      process.env.BLOCKCYPHER_API_VERSION
    }/${this.blockcyperNetwork(coin)}/${endpoint}?token=${
      process.env.BLOCKCYPHER_API_TOKEN
    }`;
  }

  async getPriceFromBC(coin) {
    const url = this.buildBlockcypherApiUrl(coin, '');
    try {
      const response = await axios.get(url);
      if (response.data) {
        const data = response.data;
        const appendZeros = Math.pow(10, 8);
        const networkFeeMin = data.low_fee_per_kb / appendZeros;
        const networkFeeAvg = data.medium_fee_per_kb / appendZeros;
        const networkFeeMax = data.high_fee_per_kb / appendZeros;
        return { networkFeeAvg, networkFeeMax, networkFeeMin };
      }
    } catch (e) {
      console.log('get price from bc: ', e);
    }
  }

  async getSparkLineData(
    coingeckoId: string,
    vs_currency: string,
    days: string,
  ) {
    try {
      const res = await this.http
        .get(
          `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=${vs_currency}&days=${days}`,
        )
        .toPromise();
      return res.data?.prices;
    } catch (e) {
      throw new Error(
        "couldn't get saprk line data from coingecko for " +
          coingeckoId +
          ' and ' +
          vs_currency +
          ' for ' +
          days,
      );
    }
  }

  transformPriceChartData(sparkline: any[]) {
    return sparkline.map((point) => ({
      timestamp: point[0],
      price: point[1],
    }));
  }

  /**
   * this method is used to get history for 1d, 7d, 30d, 90d
   * @param coingeckoId
   * @param vs_currency
   * @param fixedPrice // if admin has fixed the price
   */
  async getMarketChart(coingeckoId: string, vs_currency: string) {
    /** get data for 1d*/
    const spark_line_1_day = await this.getSparkLineData(
      coingeckoId,
      vs_currency,
      '1d',
    );
    /** get data for 7d*/
    const spark_line_7_day = await this.getSparkLineData(
      coingeckoId,
      vs_currency,
      '7d',
    );
    /** get data for 30d*/
    const spark_line_30_day = await this.getSparkLineData(
      coingeckoId,
      vs_currency,
      '30d',
    );
    /** get data for 90d*/
    const spark_line_90_day = await this.getSparkLineData(
      coingeckoId,
      vs_currency,
      '90d',
    );

    return {
      spark_line_1_day: this.transformPriceChartData(spark_line_1_day),
      spark_line_7_day: this.transformPriceChartData(spark_line_7_day),
      spark_line_30_day: this.transformPriceChartData(spark_line_30_day),
      spark_line_90_day: this.transformPriceChartData(spark_line_90_day),
    };
  }

  async fixedAssetSparkline(coin, timeline) {
    const ago = await moment().subtract(timeline, 'days').valueOf();
    const timelineHistory = await coin.fixedRateHistory.filter((history) => {
      return history.timestamp > ago;
    });
    if (timelineHistory.length) {
      if (timelineHistory.length > 1) {
        return timelineHistory;
      } else {
        return [
          {
            timestamp: ago,
            price: timelineHistory[0].price,
          },
          ...timelineHistory,
        ];
      }
    } else {
      return [
        {
          timestamp: ago,
          price: coin.fixedRate,
        },
        {
          timestamp: await moment().valueOf(),
          price: coin.fixedRate,
        },
      ];
    }
  }
}
