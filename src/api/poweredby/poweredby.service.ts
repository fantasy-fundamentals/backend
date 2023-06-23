import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PoweredByDocument,
  PoweredBy,
} from 'src/database/entities/poweredBy.entity';

@Injectable()
export class PoweredByService {
  constructor(
    @InjectModel(PoweredBy.name)
    private readonly poweredByModel: Model<PoweredByDocument>,
  ) {}

  async create(payload): Promise<object> {
    try {
      await this.poweredByModel.create(payload);
      return {
        status: 201,
        message: 'Record added successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async get(): Promise<PoweredByDocument[]> {
    try {
      return await this.poweredByModel.find();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async update(_id, payload): Promise<Object> {
    try {
      await this.poweredByModel.findByIdAndUpdate(_id, payload);
      return {
        status: 201,
        message: 'Record updated successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async delete(_id): Promise<Object> {
    try {
      const found = this.poweredByModel.findById({ _id });
      if (!found) {
        throw new BadRequestException('Record not found');
      }
      await this.poweredByModel.findByIdAndDelete(_id);
      return {
        status: 201,
        message: 'Record deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
