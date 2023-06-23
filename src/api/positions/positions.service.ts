import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PositionDocument,
  PositionEntity,
} from 'src/database/entities/position.entity';

@Injectable()
export class PositionService {
  constructor(
    @InjectModel(PositionEntity.name)
    private readonly positionModel: Model<PositionDocument>,
  ) {}

  async create(payload): Promise<object> {
    try {
      await this.positionModel.create(payload);
      return {
        status: 201,
        message: 'Position created successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async get(): Promise<PositionEntity[]> {
    try {
      return await this.positionModel.find();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async update(id, payload): Promise<Object> {
    try {
      await this.positionModel.findByIdAndUpdate(id, payload);
      return {
        status: 201,
        message: 'Position updated successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async delete(_id): Promise<Object> {
    try {
      const found = await this.positionModel.findById({ _id });
      if (!found) {
        throw new BadRequestException('Positionnot found');
      }
      await this.positionModel.findByIdAndDelete(_id);
      return {
        status: 201,
        message: 'Position deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async status(payload): Promise<object> {
    let { id, active } = payload;

    try {
      await this.positionModel.findByIdAndUpdate(id, {
        active,
      });

      return {
        message: 'Status updated successfully!',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
