import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FeeManagementDocument,
  FeeManagementEntity,
} from 'src/database/entities/fee-management.entity';
import { FeeManagementDto } from './dto/fee-management.dto';

@Injectable()
export class FeeManagementService {
  constructor(
    @InjectModel(FeeManagementEntity.name)
    private readonly feeModel: Model<FeeManagementDocument>,
  ) {}

  // add fee
  async addFee(fee: FeeManagementDto): Promise<Object> {
    try {
      await this.feeModel.create(fee);
      return {
        status: 201,
        message: 'Fee successfully added',
      };
    } catch (e) {
      throw new BadRequestException(
        'Some values are missing',
        'Internal Server Error',
      );
    }
  }
}
