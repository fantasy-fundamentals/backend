import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NftDocument, NftEntity } from 'src/database/entities/nft.entity';
import {
  UserAndMintedNftDocument,
  UserAndMintedNftEntity,
} from 'src/database/entities/user-and-minted-nfts.entity';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
  PaginationDto,
} from 'src/shared/DTOs/paginated-page-limit.dto';
import { EmailHandlerService } from '../email-handler/email-handler.service';
import { MintedNftBiddingService } from '../minted-nft-bidding/mintednft-bidding.service';
import { CreateMintedNftBiddingDTO } from './models/create-minted-nft-bidding.dto';
import axios from 'axios';
import { SOCKET_TYPES } from '../gateways/types/socketTypes';
import { GatewaysService } from '../gateways/gateways.service';
import { UserEntity } from 'src/database/entities/user.entity';
import { BurnRequestService } from '../burn-request/burn-request.service';
var ObjectId = require('mongodb').ObjectId;

@Injectable()
export class UserAndMintedNftService {
  constructor(
    @InjectModel(UserAndMintedNftEntity.name)
    private readonly userAndMintedNftModel: Model<UserAndMintedNftDocument>,
    @InjectModel(NftEntity.name)
    private readonly nftModel: Model<NftDocument>,
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserEntity>,
    private readonly mintedNftBiddingService: MintedNftBiddingService,
    private readonly emailHandler: EmailHandlerService,
    private readonly gatewayService: GatewaysService,
    private readonly burnRequestService: BurnRequestService,
  ) {}

  canCreateBid(mintedNftOwnerId: string, bidderId: string) {
    return mintedNftOwnerId === bidderId ? false : true;
  }

  async findById(_id: string) {
    return await this.userAndMintedNftModel.findOne({ _id });
  }

  async createBid(
    body: CreateMintedNftBiddingDTO,
    mintedNftId: string,
    user: any,
  ) {
    const eitherMintedNftOrNull = await this.findById(mintedNftId);
    if (eitherMintedNftOrNull === null) {
      throw new HttpException('Minted nft not found', HttpStatus.NOT_FOUND);
    }

    if (
      this.canCreateBid(
        eitherMintedNftOrNull.userId.toString(),
        user._id.toString(),
      ) === false
    ) {
      throw new HttpException(
        'Can not bid for your own minted nft',
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdBid =
      await this.mintedNftBiddingService.createMintedNftBidding({
        ...body,
        mintedNftId,
      });

    const mintedNft = await this.userAndMintedNftModel.findOne({
      _id: mintedNftId,
    });

    const mintedNftOwner = await this.userModel.findOne({
      _id: mintedNft.userId,
    });

    await this.emailHandler.sendBidReceivedEmailToSeller(
      createdBid,
      mintedNftOwner.email,
    );

    const bids = await this.mintedNftBiddingService.getAll(mintedNftId);

    this.gatewayService.emit(
      {
        type: SOCKET_TYPES.GET_NFT_BIDS,
        data: bids,
      },
      'getNftBids',
    );

    return {
      message: 'Bid placed successfully',
    };
  }

  async acceptBid(mintedNftId: string, bidId: string, user: any) {
    const userId = user._id.toString();

    const eitherMintedNftOrNull = await this.userAndMintedNftModel.findOne({
      _id: mintedNftId,
      userId: userId,
      isPurchased: false,
    });
    if (eitherMintedNftOrNull === null) {
      throw new HttpException('Minted nft not found', HttpStatus.NOT_FOUND);
    }

    const eitherBidOrNull =
      await this.mintedNftBiddingService.findByOwnIdAndMintedNftId(
        bidId,
        mintedNftId,
      );
    if (eitherBidOrNull === null || eitherBidOrNull.isActive === false) {
      throw new HttpException('Bid not found', HttpStatus.NOT_FOUND);
    }

    await this.emailHandler.sendBidAcceptanceEmailToUser(
      eitherBidOrNull,
      eitherMintedNftOrNull.walletAddress,
    );
    await this.mintedNftBiddingService.disableBid(eitherBidOrNull._id);

    return {
      message: 'Email has been sent to the respective user',
    };
  }

  async getDetail(mintedNftId: string, user: any) {
    const aggregationPipelineResult =
      await this.userAndMintedNftModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(mintedNftId),
          },
        },
        {
          $lookup: {
            from: 'mintednftbiddingentities',
            localField: '_id',
            foreignField: 'mintedNftId',
            as: 'biddings',
          },
        },
        {
          $project: {
            count: 1,
            available: 1,
            listingCount: 1,
            walletAddress: 1,
            listingPrice: 1,
            mintedNftId: '$_id',
            blockChainMintedNftId: {
              $arrayElemAt: ['$mintedIds', 0],
            },
            _id: 0,
            nftId: '$nftId',
            biddings: 1,
            activeMarketplace: 1,
            userId: '$userId',
          },
        },
        {
          $addFields: {
            isMintedByMe: {
              $eq: ['$userId', new Types.ObjectId(user._id.toString())],
            },
          },
        },
        {
          $lookup: {
            from: 'nftentities',
            localField: 'nftId',
            foreignField: '_id',
            as: 'nft',
          },
        },
        {
          $unwind: {
            path: '$nft',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            'biddings._id': 1,
            'biddings.bidderId': 1,
            'biddings.bidderName': 1,
            'biddings.bidderEmail': 1,
            'biddings.biddingPrice': 1,
            'biddings.bidderWalletAddress': 1,
            'biddings.isActive': 1,
            'biddings.createdAt': 1,
            nft: {
              blockChainMintedNftId: '$blockChainMintedNftId',
              id: '$nft.nftId',
              walletAddress: '$walletAddress',
              listingPrice: '$listingPrice',
              playerId: '$nft.playerId',
              playerDetail: '$nft.playerDetail',
              meta: '$nft.meta',
              value: '$nft.value',
              count: '$count',
              available: '$available',
              isMintedByMe: '$isMintedByMe',
              mintedNftId: '$mintedNftId',
              activeMarketplace: '$activeMarketplace',
              listingCount: '$listingCount',
            },
          },
        },
      ]);
    let nft = null;
    if (aggregationPipelineResult.length > 0) {
      nft = await this.nftModel.findOne({
        nftId: aggregationPipelineResult[0].nft.id,
      });
    }
    const totalMinted =
      (
        await this.userAndMintedNftModel.aggregate([
          {
            $match: {
              nftId: new ObjectId(nft._id),
            },
          },
          {
            $group: {
              _id: '$nftId',
              sum: {
                $sum: '$count',
              },
            },
          },
          {
            $project: {
              _id: 0,
              sum: 1,
            },
          },
        ])
      )?.[0]?.sum || 0;
    return {
      data:
        aggregationPipelineResult.length > 0
          ? aggregationPipelineResult[0]
          : {},
      totalMinted,
    };
  }

  async isMinted(nftId: string) {
    var o_id = new ObjectId(nftId);
    let totalMinted = await this.userAndMintedNftModel
      .find({ nftId: o_id })
      .count();

    if (totalMinted > 0) {
      return true;
    }

    return false;
  }

  async listAllNftsMintedByLoggedInUser(user, query: PaginationDto) {
    const page = query.page || DEFAULT_PAGINATION_PAGE;
    const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
    const skip = page * limit;

    const aggegationQuery = [
      {
        $match: {
          userId: new Types.ObjectId(user._id),
        },
      },
      {
        $lookup: {
          from: 'nftentities',
          localField: 'nftId',
          foreignField: '_id',
          as: 'correspondingNft',
        },
      },
      {
        $unwind: {
          path: '$correspondingNft',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          isMintedByMe: true,
        },
      },
      {
        $project: {
          _id: 0,
          mintedNftId: '$_id',
          blockchainNftId: '$mintedIds',
          nftId: '$correspondingNft.nftId',
          playerId: '$correspondingNft.playerId',
          playerDetail: '$correspondingNft.playerDetail',
          meta: '$correspondingNft.meta',
          count: 1,
          value: '$correspondingNft.value',
          activeMarketplace: 1,
          isMintedByMe: 1,
          createdAt: 1,
        },
      },
    ];

    const data = await this.userAndMintedNftModel.aggregate(aggegationQuery);
    return {
      data: await this.userAndMintedNftModel
        .aggregate(aggegationQuery)
        .sort({ createdAt: 'desc' })
        .skip(skip)
        .limit(limit),
      total:
        (
          await this.userAndMintedNftModel.aggregate([
            ...aggegationQuery,
            { $count: 'total' },
          ])
        )?.[0]?.total || 0,
    };
  }

  async toggleActiveMarketplaceFlag(
    user: any,
    mintedNftId: string,
    quantity,
    listingPrice,
  ) {
    listingPrice = +listingPrice;
    const eitherMintedNftOrNull = await this.findById(mintedNftId);

    if (eitherMintedNftOrNull === null) {
      throw new HttpException('Minted Nft not found', HttpStatus.NOT_FOUND);
    }

    if (
      JSON.stringify(eitherMintedNftOrNull.userId) !== JSON.stringify(user._id)
    ) {
      throw new HttpException(
        'This Minted Nft does not belong to you',
        HttpStatus.BAD_REQUEST,
      );
    }

    eitherMintedNftOrNull.available =
      eitherMintedNftOrNull.available - quantity;
    eitherMintedNftOrNull.listingCount = quantity;
    eitherMintedNftOrNull.listingPrice = listingPrice ? listingPrice : 0;
    eitherMintedNftOrNull.activeMarketplace =
      !eitherMintedNftOrNull.activeMarketplace;

    await Promise.all([
      eitherMintedNftOrNull.save(),
      this.mintedNftBiddingService.deleteManyByMintedNftId(
        eitherMintedNftOrNull._id,
      ),
    ]);

    this.gatewayService.emit(
      {
        type: SOCKET_TYPES.ACTIVE_MARKETPLACE,
        data: {
          _id: eitherMintedNftOrNull._id,
          isMinted: await this.isMinted(
            eitherMintedNftOrNull.nftId as unknown as string,
          ),
          activeMarketplace: eitherMintedNftOrNull.activeMarketplace,
        },
      },
      SOCKET_TYPES.ACTIVE_MARKETPLACE,
    );

    return {
      message: 'Successfully updated',
    };
  }

  async burn(mintedNftId: string, user: any) {
    try {
      const mintedNft = await this.userAndMintedNftModel.findOne({
        _id: mintedNftId,
      });

      if (mintedNft === null) {
        throw new HttpException('Nft not found', HttpStatus.NOT_FOUND);
      }

      if (JSON.stringify(mintedNft.userId) != JSON.stringify(user._id)) {
        throw new ForbiddenException('Sorry, This nft was not minted by you');
      }

      // if (mintedNft.available <= 0) {
      //   throw new HttpException(
      //     `You don't have engough available nft`,
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      let quantity = 0;

      for (let index = 0; index < mintedNft?.mintedIds.length; index++) {
        const element = mintedNft?.mintedIds[index];
        quantity = element.quantity;

        const payload = {
          mintScript: {
            keyHash: process.env.KEY_HASH,
            type: process.env.TYPE,
          },
          nftId: `${element.id}`,
          quantity: +element.quantity,
          signerAddress: process.env.SIGNER_ADDRESS,
          signerName: process.env.SIGNER_NAME,
        };

        const url = `${process.env.CARDANO_NODE}/nft/burn`;
        await axios.post(url, payload);

        await this.userAndMintedNftModel.findByIdAndUpdate(mintedNftId, {
          $inc: { available: -element.quantity },
        });

        this.gatewayService.emit(
          {
            type: SOCKET_TYPES.BURN,
            data: {
              _id: mintedNft._id,
              isMinted: await this.isMinted(
                mintedNft.nftId as unknown as string,
              ),
              burn: true,
            },
          },
          SOCKET_TYPES.BURN,
        );
      }

      await this.userAndMintedNftModel.findByIdAndDelete(mintedNftId);

      const correspondingNft = await this.nftModel.findOne({
        _id: mintedNft.nftId,
      });

      await this.burnRequestService.addRequest({
        quantity,
        userId: user._id,
        nftId: correspondingNft._id,
        listingPrice: mintedNft.listingPrice,
        nftValue: correspondingNft.value,
        walletAddress: mintedNft.walletAddress,
      });

      await this.emailHandler.sendBurnRequestReceivedEmail();

      return {
        message: 'NFT Burn is set for review',
      };
    } catch (err) {
      console.log(err.message);
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
