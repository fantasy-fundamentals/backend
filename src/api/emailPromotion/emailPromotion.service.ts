import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailPromotionDocument,
  EmailPromotionEntity,
} from 'src/database/entities/emailPromotion.entity';

@Injectable()
export class EmailPromotionService {
  constructor(
    @InjectModel(EmailPromotionEntity.name)
    private readonly emailPromotionModal: Model<EmailPromotionDocument>,
  ) {}

  async create(payload): Promise<object> {
    try {
      await this.emailPromotionModal.create(payload);
      return {
        messsage: 'Email promotion requested successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async get() {
    try {
      return await this.emailPromotionModal.find();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async approve(userAddress) {
    try {
      let kyc = await this.emailPromotionModal.findOne({ userAddress });

      if (kyc) {
        await this.emailPromotionModal.findOneAndUpdate(userAddress, {
          status: !kyc.status,
        });
      } else {
        await this.emailPromotionModal.findOneAndUpdate(userAddress, {
          status: true,
        });
      }

      return {
        status: 201,
        message: 'Email promotion approved successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
