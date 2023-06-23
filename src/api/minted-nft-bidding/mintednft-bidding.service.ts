import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MintedNftBiddingDocument,
  MintedNftBiddingEntity,
} from 'src/database/entities/minted-nft-bidding';
import { CreateMintedNftBiddingDTO } from './models/create-minted-nft-bidding.dto';
var ObjectId = require('mongodb').ObjectId;

@Injectable()
export class MintedNftBiddingService {
  constructor(
    @InjectModel(MintedNftBiddingEntity.name)
    private readonly mintedNftBiddingModel: Model<MintedNftBiddingDocument>,
  ) {}

  // async getAllBidsByBidderId(query: PaginationDto, bidderId: string): Promise<{ data: any[], total: number }> {
  //   const page = query.page || DEFAULT_PAGINATION_PAGE;
  //   const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
  //   const skip = page * limit;

  //   const data = await this.mintedNftBiddingModel.find({ bidderId }).skip(skip).limit(limit);
  //   const total = await this.mintedNftBiddingModel.countDocuments({ bidderId });

  //   return {
  //     data,
  //     total
  //   }
  // }

  // async getSingleBidDetailByBidderId(_id: string, bidderId: string) {
  //   const eitherBidOrNull = await this.mintedNftBiddingModel.findOne({ _id, bidderId })
  //   if (eitherBidOrNull === null) {
  //     throw new HttpException(
  //       'Bid not found',
  //       HttpStatus.NOT_FOUND
  //     )
  //   }
  //   return {
  //     bid: eitherBidOrNull
  //   }
  // }

  async disableBid(bidId: string) {
    return await this.mintedNftBiddingModel.findByIdAndUpdate(bidId, {
      isActive: false,
    });
  }

  async findByOwnIdAndMintedNftId(bidId: string, mintedNftId: string) {
    return await this.mintedNftBiddingModel.findOne({
      _id: bidId,
      mintedNftId,
    });
  }

  async findById(_id: string) {
    return await this.mintedNftBiddingModel
      .findOne({ _id })
      .populate('mintedNftId');
  }

  async createMintedNftBidding(body: CreateMintedNftBiddingDTO) {
    return await this.mintedNftBiddingModel.create(body);
  }

  async deleteManyByMintedNftId(mintedNftId: string) {
    return await this.mintedNftBiddingModel.deleteMany({
      mintedNftId
    })
  }

  async getAll(mintedNftId: string) {
    var o_id = new ObjectId(mintedNftId);

    return await this.mintedNftBiddingModel.find({ mintedNftId: o_id });
  }
}
