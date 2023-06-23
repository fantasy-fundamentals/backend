import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import {
  CoinManagemnetEntity,
  CoinManagemnetDocument,
} from 'src/database/entities/coin-managemnet.entity';
import {
  PromoteDocument,
  PromoteEntity,
} from 'src/database/entities/promote.entity';
import { Rate, RateDocument } from 'src/database/entities/rates.entity';
import { PROMOTION_STATUS } from 'src/utils/misc/enum';
import { ApprovePromotionDto } from './dto/promote.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(PromoteEntity.name)
    private readonly promotionModel: Model<PromoteDocument>,

    @InjectModel(CoinManagemnetEntity.name)
    private readonly coinManagementModel: Model<CoinManagemnetDocument>,

    @InjectModel(Rate.name)
    private readonly coinRate: Model<RateDocument>,
  ) {}

  async create(promotion): Promise<object> {
    return await this.promotionModel.create(promotion);
  }

  async get(type: string, limit: number) {
    try {
      const coins = await this.promotionModel
        .find({
          status: PROMOTION_STATUS.APPROVED,
          type,
          dates: {
            $in: moment().format('ll'),
          },
        })
        .limit(limit);
      const foundRate = await this.coinRate.find();

      let response = [];
      for (let coin of coins) {
        const rate = foundRate.find((r) => r.coinSymbol == coin.coinSymbol);
        const coinsManagement = await this.coinManagementModel.findOne({
          symbol: coin.coinSymbol,
        });
        response.push({
          ...coin?.toJSON(),
          ...rate?.toJSON(),
          ...coinsManagement?.toJSON(),
        });
      }

      console.log(response);

      return response;
    } catch (error) {
      throw new BadRequestException('Internal server error');
    }
  }

  async approve(approveDto: ApprovePromotionDto): Promise<object> {
    let { id, status } = approveDto;
    try {
      const found = await this.promotionModel.findById({ _id: id });
      if (!found) {
        throw new BadRequestException(`Record not found against this id ${id}`);
      }

      await this.promotionModel.findByIdAndUpdate(id, { status });
      return {
        message: 'Promotion status updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.response);
    }
  }

  async getAllAdmin(): Promise<any[]> {
    try {
      return await this.promotionModel.find();
    } catch (error) {
      throw new BadRequestException(error.response);
    }
  }

  async validateDate(date: string, type: string) {
    try {
      const coins = await this.promotionModel.find({
        status: PROMOTION_STATUS.APPROVED,
        type,
        dates: {
          $in: moment(date).format('ll'),
        },
      });

      if (
        (type === 'banner' && coins?.length >= 4) ||
        (type === 'press' && coins?.length >= 4) ||
        (type === 'coin' && coins?.length >= 3)
      ) {
        throw new BadRequestException(
          `${moment(date).format('MMM Do')} is already booked for promotion`,
        );
      } else {
        return 200;
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getDaysArrayByMonth(month) {
    var daysInMonth = moment(month).daysInMonth();
    var arrDays = [];

    while (daysInMonth) {
      var current = moment(month).date(daysInMonth).format('ll');
      arrDays.push(current);
      daysInMonth--;
    }

    return arrDays.reverse();
  }

  async validateMonth(month: string, type: string) {
    try {
      var days = await this.getDaysArrayByMonth(month);

      const counts = {};

      for (let index = 0; index < days.length; index++) {
        const element = days[index];

        let coins = await this.promotionModel.find({
          status: PROMOTION_STATUS.APPROVED,
          type,
          dates: {
            $in: element,
          },
        });

        counts[`${element}`] = coins.length;
      }
      return counts;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
