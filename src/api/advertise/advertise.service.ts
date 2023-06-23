import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AdvertiseDocument,
  AdvertiseEntity,
} from 'src/database/entities/advertise.entity';

@Injectable()
export class AdvertiseService {
  constructor(
    @InjectModel(AdvertiseEntity.name)
    private readonly advertiseModel: Model<AdvertiseDocument>,
  ) {}

  async addAdvertise(advertise): Promise<object> {
    try {
      await this.advertiseModel.create(advertise);
      return {
        status: 201,
        message: 'Advertise added successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getAdvertise(): Promise<AdvertiseDocument[]> {
    try {
      return await this.advertiseModel.find();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async updateAdvertise(advertiseId, advertise): Promise<Object> {
    try {
      await this.advertiseModel.findByIdAndUpdate(advertiseId, advertise);
      return {
        status: 201,
        message: 'Advertisement is updated successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async deleteAdvertise(advertiseId): Promise<Object> {
    try {
      const found = this.advertiseModel.findById({ _id: advertiseId });
      if (!found) {
        throw new BadRequestException('Record not found');
      }
      await this.advertiseModel.findByIdAndDelete(advertiseId);
      return {
        status: 201,
        message: 'Advertisement deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
