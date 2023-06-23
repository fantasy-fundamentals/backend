import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NftWhitelistDocument,
  NftWhitelistEntity,
} from 'src/database/entities/nft-whitelist.entity';

@Injectable()
export class NftWhitelistService {
  constructor(
    @InjectModel(NftWhitelistEntity.name)
    private readonly nftModal: Model<NftWhitelistDocument>,
  ) {}

  async create(payload): Promise<object> {
    try {
      return await this.nftModal.create(payload);
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async get() {
    try {
      return await this.nftModal.find();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
