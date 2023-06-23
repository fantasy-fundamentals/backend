import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NewsCategoryDocument,
  NewsCategoryEntity,
} from 'src/database/entities/newsCategory.entity';

@Injectable()
export class NewsCategoryService {
  constructor(
    @InjectModel(NewsCategoryEntity.name)
    private readonly newsCategoryModel: Model<NewsCategoryDocument>,
  ) {}

  async create(payload): Promise<object> {
    try {
      await this.newsCategoryModel.create(payload);
      return {
        status: 201,
        message: 'News category created successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async get(): Promise<NewsCategoryDocument[]> {
    try {
      return await this.newsCategoryModel.find();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async update(id, payload): Promise<Object> {
    try {
      await this.newsCategoryModel.findByIdAndUpdate(id, payload);
      return {
        status: 201,
        message: 'News category updated successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async delete(_id): Promise<Object> {
    try {
      const found = await this.newsCategoryModel.findById({ _id });
      if (!found) {
        throw new BadRequestException('News category not found');
      }
      await this.newsCategoryModel.findByIdAndDelete(_id);
      return {
        status: 201,
        message: 'News category deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async status(payload): Promise<object> {
    let { id, active } = payload;

    try {
      await this.newsCategoryModel.findByIdAndUpdate(id, {
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
