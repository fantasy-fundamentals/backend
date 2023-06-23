import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CoinManagemnetDocument,
  CoinManagemnetEntity,
} from 'src/database/entities/coin-managemnet.entity';
import { KycDocument, KycEntity } from 'src/database/entities/kyc.entity';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(KycEntity.name)
    private readonly kycModal: Model<KycDocument>,

    @InjectModel(CoinManagemnetEntity.name)
    private readonly coinManagemnetModal: Model<CoinManagemnetDocument>,
  ) {}

  async uploadkyc(kyc): Promise<object> {
    try {
      await this.kycModal.create(kyc);
      return {
        messsage: 'Kyc added successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async get() {
    try {
      return await this.kycModal.find();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async approve(userAddress) {
    try {
      let kyc = await this.kycModal.findOne({ userAddress });

      if (kyc) {
        await this.kycModal.findOneAndUpdate(userAddress, {
          status: !kyc.status,
        });

        // update kyc status for coins
        await this.coinManagemnetModal.updateMany(
          { userAddress },
          { $set: { kycApproved: !kyc.status } },
        );
      } else {
        await this.kycModal.findOneAndUpdate(userAddress, { status: true });

        // update kyc status for coins
        await this.coinManagemnetModal.updateMany(
          { userAddress },
          { $set: { kycApproved: !kyc.status } },
        );
      }

      return {
        status: 201,
        message: 'KYC approved successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
