import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Marketplace,
  MarketplaceDocument,
} from 'src/database/entities/marketplace.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectModel(Marketplace.name)
    private readonly marketplaceModel: Model<MarketplaceDocument>,
  ) {}

  async create(payload): Promise<object> {
    return await this.marketplaceModel.create(payload);
  }

  async get() {
    try {
      return await this.marketplaceModel.find();
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async getAllAdmin(): Promise<any[]> {
    try {
      return await this.marketplaceModel.find();
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
