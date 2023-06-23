import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NFTMarketplaceEntity,
  NFTMarketplaceDocument,
} from 'src/database/entities/nft-marketplace.entity';
import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE, PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';
import { CreateNFTMarketplaceEntityDTO } from './model/create-nft-marketplace-entity.dto';

@Injectable()
export class NFTMarketplaceService {
  constructor(
    @InjectModel(NFTMarketplaceEntity.name)
    private readonly nftMarketplaceModel: Model<NFTMarketplaceDocument>,
  ) { }

  async create(payload: CreateNFTMarketplaceEntityDTO): Promise<object> {
    const { sellerId, ...payloadWithoutSellerId } = payload;
    return await this.nftMarketplaceModel.create({
      ...payloadWithoutSellerId,
      seller: sellerId
    });
  }

  async listAll(
    query: PaginationDto,
  ): Promise<{ data: NFTMarketplaceEntity[]; total: number }> {
    const page = query.page || DEFAULT_PAGINATION_PAGE
    const limit = query.limit || DEFAULT_PAGINATION_LIMIT
    const skip = page * limit

    const data = await this.nftMarketplaceModel
      .find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    const total = await this.nftMarketplaceModel.countDocuments()

    return { data, total }
  }
}
