import { Injectable, BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import {
  CounterEntity,
  CounterDocument,
} from 'src/database/entities/counter.entity';
import { NftDocument, NftEntity } from 'src/database/entities/nft.entity';
import {
  PlayerEntity,
  PlayerDocument,
} from 'src/database/entities/player.entity';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
} from 'src/shared/DTOs/paginated-page-limit.dto';
import axios from 'axios';
import {
  FilterNftWithPaginationDto,
  NftMintDto,
} from './models/filter-nft.dto';
import { UpdateNftDTO } from './models/update-nft.dto';
import { HttpException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import {
  UserAndMintedNftDocument,
  UserAndMintedNftEntity,
} from 'src/database/entities/user-and-minted-nfts.entity';
import { UserAndMintedNftService } from '../user-and-minted-nfts/user-and-minted-nft.service';
import { S3StorageService } from '../s3Storage/s3Storage.service';
import { GatewaysService } from '../gateways/gateways.service';
import { SOCKET_TYPES } from '../gateways/types/socketTypes';
import {
  MintedNftBiddingDocument,
  MintedNftBiddingEntity,
} from 'src/database/entities/minted-nft-bidding';
var fs = require('fs');
var path = require('path');
var ObjectId = require('mongodb').ObjectId;
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Injectable()
export class NftService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(NftEntity.name)
    private readonly nftModel: Model<NftDocument>,
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerDocument>,
    @InjectModel(CounterEntity.name)
    private readonly counterModel: Model<CounterDocument>,
    @InjectModel(UserAndMintedNftEntity.name)
    private readonly userAndMintedNftModel: Model<UserAndMintedNftDocument>,
    private userAndMintedNftService: UserAndMintedNftService,
    private readonly s3Storage: S3StorageService,

    @InjectModel(MintedNftBiddingEntity.name)
    private readonly mintedNftBiddingModel: Model<MintedNftBiddingDocument>,
    private readonly gatewayService: GatewaysService,
  ) {
    // setTimeout(() => {
    //   this.claimBack(
    //     '63b3da0d4d69b274697127f6',
    //     'addr_test1qrk06wtmuw4l8ptlyt4mq8h2xgsurf9yf9lwl9ane6ah5xcqxrz73sq07ga4h29z2w6eystmhgmuqg6pmxxjk5n5n9mqcw2adx',
    //   );
    // }, 5000);
  }

  async findById(_id: string) {
    return await this.nftModel.findOne({ _id });
  }

  private async getAllPlayersCount(): Promise<number> {
    return await this.playerModel.countDocuments();
  }

  private async getNftHoldingPlayersIds(): Promise<number[]> {
    return (await this.nftModel.find({}).lean()).map((nft) => {
      return nft.playerId;
    });
  }

  private async getNftHoldingPlayersCount(): Promise<number> {
    const data = await this.nftModel.find({}).lean().countDocuments();
    return data;
  }

  private async getPlayersNotHoldingNft(): Promise<
    { id: number; detail: object }[]
  > {
    return (
      await this.playerModel
        .find({
          playerId: {
            $nin: await this.getNftHoldingPlayersIds(),
          },
        })
        .lean()
    ).map((player) => {
      return { id: player.playerId, detail: player.detail };
    });
  }

  private async isSyncOperationNeeded(): Promise<boolean> {
    return (await this.getAllPlayersCount()) -
      (await this.getNftHoldingPlayersCount()) ===
      0
      ? false
      : true;
  }

  private async generateUniqueNftId() {
    const NFT_SCHEMA_NAMESPACE = 'nft-entities-namespace';

    const existingCounterDocument = await this.counterModel.findOne({
      collectionName: NFT_SCHEMA_NAMESPACE,
    });

    if (existingCounterDocument === null) {
      const newlyCreatedCounterDocument = await this.counterModel.create({
        collectionName: NFT_SCHEMA_NAMESPACE,
      });
      return newlyCreatedCounterDocument.seq;
    } else {
      const updatedCounterDocument = await this.counterModel.findByIdAndUpdate(
        existingCounterDocument?._id,
        {
          $inc: { seq: 1 },
        },
        { new: true, upsert: true },
      );
      return updatedCounterDocument?.seq as number;
    }
  }

  async sync() {
    if (await this.isSyncOperationNeeded()) {
      const promiseToResolveArr = [];
      const playersNotHoldingNft = await this.getPlayersNotHoldingNft();

      for (let i = 0; i < playersNotHoldingNft.length; i++) {
        const { id, detail } = playersNotHoldingNft[i];

        const {
          Name,
          Status,
          Height,
          Weight,
          Experience,
          Active,
          Age,
          BirthDateString,
          PhotoUrl,
          Team,
          Position,
        } = detail as any;
        promiseToResolveArr.push(
          this.nftModel.findOneAndUpdate(
            { playerId: id },
            {
              nftId: await this.generateUniqueNftId(),
              playerId: id,
              playerDetail: {
                Name,
                Status,
                Height,
                Weight,
                Experience,
                Active,
                Age,
                BirthDateString,
                PhotoUrl,
                Description: '',
                Team,
                Position,
              },
              value: 20,
              meta: {
                name: Name,
                quantity: 0,
                videoUrl: '',
              },
            },
            {
              upsert: true,
              new: true,
            },
          ),
        );
        console.log('NFT sync: ', promiseToResolveArr.length);
      }

      try {
        await Promise.all(promiseToResolveArr);
        console.log('Nft sync completed');
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log('NFT Sync operation not required');
    }

    return true;
  }

  async update(nftId: string, payload: UpdateNftDTO) {
    const eitherNftOrNull = await this.nftModel.findOne({ _id: nftId });

    if (eitherNftOrNull === null) {
      throw new HttpException('Nft not found', HttpStatus.NOT_FOUND);
    }

    if ('value' in payload) {
      eitherNftOrNull.value = payload.value;
    }

    if ('videoUrl' in payload) {
      const meta = eitherNftOrNull.meta;
      eitherNftOrNull.meta = {
        ...meta,
        videoUrl: payload.videoUrl,
      };
    }

    await eitherNftOrNull.save();
    return {
      message: 'Nft updated successfully',
    };
  }

  async listAllForAdmin(query) {
    try {
      // Pagination Related Variables
      const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
      const page = query.page || DEFAULT_PAGINATION_PAGE;
      const skip = page * limit;

      // Fields that are matched using Regex
      const likeSearchFields = ['name'];

      // Object containing fields that define how data coming from FrontEnd would map to Mongo-Document
      const queryFiltersMappedObject = {
        name: 'playerDetail.Name',
        status: 'playerDetail.Status',
      };

      // QueryFilterObject
      const queryFilters = {};

      // Logic to prepare final queryFilterObject
      const skippableKeys = ['limit', 'page'];
      for (const [key, value] of Object.entries(query)) {
        if (skippableKeys.includes(key)) {
          continue;
        } else {
          const mappedKey = queryFiltersMappedObject[key];
          if (likeSearchFields.includes(key)) {
            queryFilters[mappedKey] = {
              $regex: value,
              $options: 'i',
            };
          } else {
            queryFilters[mappedKey] = value;
          }
        }
      }

      const data = await this.nftModel
        .aggregate([
          {
            $match: {
              ...queryFilters,
            },
          },
          {
            $lookup: {
              from: 'userandmintednftentities',
              localField: '_id',
              foreignField: 'nftId',
              as: 'result',
            },
          },
          {
            $unwind: {
              path: '$result',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              isListedOnMarketplace: {
                $eq: ['$result.activeMarketplace', true],
              },
            },
          },
          {
            $project: {
              result: 0,
            },
          },
        ])
        .skip(skip)
        .limit(limit);
      const total = await this.nftModel.countDocuments(queryFilters);

      return { data, total };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getAllMintedNftsValue(walletAddress: string) {
    const result = await this.userAndMintedNftModel.aggregate([
      {
        $match: {
          walletAddress,
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
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 0,
          available: 1,
          value: '$nft.value',
        },
      },
    ]);

    return result.reduce((previousValue, currentObj) => {
      return previousValue + currentObj.available * currentObj.value;
    }, 0);
  }

  async listAllForAuthenticatedUser(
    query: FilterNftWithPaginationDto,
    user: any,
  ) {
    try {
      const { userId } = user;
      // Pagination Related Variables
      const _limit = query.limit || DEFAULT_PAGINATION_LIMIT;
      const _page = query.page || DEFAULT_PAGINATION_PAGE;
      const skip = _page * _limit;

      // Fields that are matched using Regex
      const likeSearchFields = ['name'];

      // Object containing fields that define how data coming from FrontEnd would map to Mongo-Document
      var queryFiltersMappedObject = null;
      if (query.team !== 'all') {
        queryFiltersMappedObject = {
          name: 'playerDetail.Name',
          status: 'playerDetail.Status',
          team: 'playerDetail.Position',
        };
      } else {
        queryFiltersMappedObject = {
          name: 'playerDetail.Name',
          status: 'playerDetail.Status',
        };
      }

      // QueryFilterObject
      const queryFilters = {};

      // Logic to prepare final queryFilterObject
      const skippableKeys = ['limit', 'page', 'email', 'minted'];
      if (['asc', 'desc'].includes(query.status)) {
        skippableKeys.push('status');
      }

      for (const [key, value] of Object.entries(query)) {
        if (skippableKeys.includes(key)) {
          continue;
        } else {
          const mappedKey = queryFiltersMappedObject[key];
          if (likeSearchFields.includes(key)) {
            queryFilters[mappedKey] = {
              $regex: value,
              $options: 'i',
            };
          } else {
            if (typeof mappedKey !== 'undefined') {
              queryFilters[mappedKey] = value;
            }
          }
        }
      }

      const { limit, page, email, minted, ...objectWithoutPageAndLimit } =
        query;
      let finalQuery: any =
        Object.keys(objectWithoutPageAndLimit).length === 0
          ? []
          : [{ $match: { ...queryFilters } }];

      if ('minted' in query) {
        finalQuery = [
          ...finalQuery,
          {
            $lookup: {
              from: 'userandmintednftentities',
              localField: '_id',
              foreignField: 'nftId',
              as: 'mintedNfts',
            },
          },
          {
            $match: {
              'mintedNfts.0': {
                $exists: true,
              },
            },
          },
          {
            $unwind: {
              path: '$mintedNfts',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $match: {
              'mintedNfts.activeMarketplace': true,
            },
          },
          {
            $project: {
              nftId: 1,
              playerId: 1,
              playerDetail: 1,
              meta: 1,
              value: 1,
              mintedNftId: '$mintedNfts._id',
              mintedBy: '$mintedNfts.userId',
              isMintedByMe: {
                $eq: ['$mintedNfts.userId', new Types.ObjectId(userId)],
              },
            },
          },
          {
            $lookup: {
              from: 'userentities',
              localField: 'mintedBy',
              foreignField: '_id',
              as: 'mintingUser',
            },
          },
          {
            $unwind: {
              path: '$mintingUser',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              nftId: 1,
              playerId: 1,
              playerDetail: 1,
              value: 1,
              meta: 1,
              mintedNftId: 1,
              mintedBy: {
                name: '$mintingUser.name',
                email: '$mintingUser.email',
              },
              isMintedByMe: 1,
            },
          },
        ];

        if (!['asc', 'desc'].includes(query.status)) {
          finalQuery.push({ $sort: { 'playerDetail.Name': 1 } });
        } else {
          finalQuery.push({
            $sort: {
              value: !query.status ? -1 : query.status == 'asc' ? 1 : -1,
            },
          });
        }

        return {
          data: await this.nftModel
            .aggregate(finalQuery)
            .skip(skip)
            .limit(_limit),
          total:
            (
              await this.nftModel.aggregate([
                ...finalQuery,
                { $count: 'total' },
              ])
            )?.[0]?.total || 0,
        };
      } else {
        const data = await this.nftModel
          .find({ ...queryFilters, status: true })
          .sort({
            ...(!['asc', 'desc'].includes(query.status) && {
              'playerDetail.Name': 1,
            }),
            ...(['asc', 'desc'].includes(query.status) && {
              value: !query.status ? 'desc' : (query.status as 'desc' | 'asc'),
            }),
          })
          .skip(skip)
          .limit(_limit);
        const total = await this.nftModel.countDocuments(queryFilters);

        return {
          data,
          total,
        };
      }
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Internal Server Error');
    }
  }

  async listForGuestUser(query: FilterNftWithPaginationDto) {
    try {
      // Pagination Related Variables
      const _limit = query.limit || DEFAULT_PAGINATION_LIMIT;
      const _page = query.page || DEFAULT_PAGINATION_PAGE;
      const skip = _page * _limit;

      // Fields that are matched using Regex
      const likeSearchFields = ['name'];

      // Object containing fields that define how data coming from FrontEnd would map to Mongo-Document
      var queryFiltersMappedObject = null;
      if (query.team !== 'all') {
        queryFiltersMappedObject = {
          name: 'playerDetail.Name',
          status: 'playerDetail.Status',
          team: 'playerDetail.Position',
        };
      } else {
        queryFiltersMappedObject = {
          name: 'playerDetail.Name',
          status: 'playerDetail.Status',
        };
      }

      // QueryFilterObject
      const queryFilters = {};

      // Logic to prepare final queryFilterObject
      const skippableKeys = ['limit', 'page', 'email', 'minted'];
      if (['asc', 'desc'].includes(query.status)) {
        skippableKeys.push('status');
      }

      for (const [key, value] of Object.entries(query)) {
        if (skippableKeys.includes(key)) {
          continue;
        } else {
          const mappedKey = queryFiltersMappedObject[key];
          if (likeSearchFields.includes(key)) {
            queryFilters[mappedKey] = {
              $regex: value,
              $options: 'i',
            };
          } else {
            if (typeof mappedKey !== 'undefined') {
              queryFilters[mappedKey] = value;
            }
          }
        }
      }

      const { limit, page, email, minted, ...objectWithoutPageAndLimit } =
        query;
      let finalQuery: any =
        Object.keys(objectWithoutPageAndLimit).length === 0
          ? []
          : [{ $match: { ...queryFilters } }];

      if ('minted' in query) {
        finalQuery = [
          ...finalQuery,
          {
            $lookup: {
              from: 'userandmintednftentities',
              localField: '_id',
              foreignField: 'nftId',
              as: 'mintedNfts',
            },
          },
          {
            $match: {
              'mintedNfts.0': {
                $exists: true,
              },
            },
          },
          {
            $unwind: {
              path: '$mintedNfts',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $match: {
              'mintedNfts.activeMarketplace': true,
            },
          },
          {
            $project: {
              nftId: 1,
              playerId: 1,
              playerDetail: 1,
              meta: 1,
              value: 1,
              mintedNftId: '$mintedNfts._id',
              mintedBy: '$mintedNfts.userId',
            },
          },
          {
            $lookup: {
              from: 'userentities',
              localField: 'mintedBy',
              foreignField: '_id',
              as: 'mintingUser',
            },
          },
          {
            $unwind: {
              path: '$mintingUser',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              nftId: 1,
              playerId: 1,
              playerDetail: 1,
              value: 1,
              meta: 1,
              mintedNftId: 1,
              mintedBy: {
                name: '$mintingUser.name',
                email: '$mintingUser.email',
              },
              //isMintedByMe: false,
            },
          },
        ];

        if (!['asc', 'desc'].includes(query.status)) {
          finalQuery.push({ $sort: { 'playerDetail.Name': 1 } });
        } else {
          finalQuery.push({
            $sort: {
              value: !query.status ? -1 : query.status == 'asc' ? 1 : -1,
            },
          });
        }

        return {
          data: await this.nftModel
            .aggregate(finalQuery)
            .skip(skip)
            .limit(_limit),
          total:
            (
              await this.nftModel.aggregate([
                ...finalQuery,
                { $count: 'total' },
              ])
            )?.[0]?.total || 0,
        };
      } else {
        const data = await this.nftModel
          .find({ ...queryFilters, status: true })
          .sort({
            ...(!['asc', 'desc'].includes(query.status) && {
              'playerDetail.Name': 1,
            }),
            ...(['asc', 'desc'].includes(query.status) && {
              value: !query.status ? 'desc' : (query.status as 'desc' | 'asc'),
            }),
          })
          .skip(skip)
          .limit(_limit);
        const total = await this.nftModel.countDocuments(queryFilters);

        return {
          data,
          total,
        };
      }
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Internal Server Error');
    }
  }

  async mintNFTs(payload: NftMintDto) {
    const imageUrl =
      'https://d2pm667mw7y58b.cloudfront.net/Images/image%20(1).png';
    const nftImageUrlSplitter = 'cloudfront.net';

    const [nftVideoUrlFirstPart, nftVideoUrlSecondPart] =
      imageUrl.split(nftImageUrlSplitter);
    const imageUrlArr = [
      nftVideoUrlFirstPart,
      nftImageUrlSplitter,
      nftVideoUrlSecondPart,
    ];

    console.log(imageUrlArr);

    try {
      const { name, videoUrl, quantity, receiverAddress, playerId } = payload;
      const mintPayload = {
        policyId: process.env.POLICY_ID,
        mintScript: {
          keyHash: process.env.KEY_HASH,
          type: process.env.TYPE,
        },
        name,
        quantity,
        videoUrl,
        imageUrl: imageUrlArr,
        receiverAddress,
        playerId,
        signerAddress: process.env.SIGNER_ADDRESS,
        signerName: process.env.SIGNER_NAME,
      };
      const url = `${process.env.CARDANO_NODE}/nft/mintTo`;
      const response = await axios.post(url, mintPayload);
      return response.data;
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  async claimBack(nftId: string, receiverAddress: string) {
    try {
      const nft = await this.userAndMintedNftModel.findById(nftId);

      for (let index = 0; index < nft.mintedIds.length; index++) {
        const mintedNftId = nft.mintedIds[index];

        const data = {
          nftId: mintedNftId.id,
          quantity: nft.listingCount,
          receiverAddress,
          signerAddress: process.env.SIGNER_ADDRESS,
          signerName: process.env.SIGNER_NAME,
        };

        const url = `${process.env.CARDANO_NODE}/nft/transfer`;
        await axios.post(url, data);
      }

      nft.available = nft.available + nft.listingCount;
      nft.listingCount = 0;
      nft.activeMarketplace = false;

      await nft.save();

      this.gatewayService.emit(
        {
          type: SOCKET_TYPES.ACTIVE_MARKETPLACE,
          data: {
            _id: nft._id,
            isMinted: await this.userAndMintedNftService.isMinted(
              nft.nftId as unknown as string,
            ),
            activeMarketplace: false,
          },
        },
        SOCKET_TYPES.ACTIVE_MARKETPLACE,
      );

      return {
        message: 'Successfully updated',
      };
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException('Error on minter server');
    }
  }

  async importCall(players) {
    console.log(players.length);

    try {
      for (let index = 0; index < players.length; index++) {
        let player = players[index];
        player = player.detail;
        let Name = player.Name;
        let FanDuelName = player.FanDuelName;
        let DraftKingsName = player.DraftKingsName;

        let file = null;
        let name = '';

        if (
          fs.existsSync(
            path.join(__dirname, '../../../nft_videos' + `/${Name}.mp4`),
          )
        ) {
          file = fs.readFileSync(
            path.join(__dirname, '../../../nft_videos' + `/${Name}.mp4`),
          );
          name = Name;
        } else if (
          fs.existsSync(
            path.join(__dirname, '../../../nft_videos' + `/${FanDuelName}.mp4`),
          )
        ) {
          file = fs.readFileSync(
            path.join(__dirname, '../../../nft_videos' + `/${FanDuelName}.mp4`),
          );
          name = FanDuelName;
        } else if (
          fs.existsSync(
            path.join(
              __dirname,
              '../../../nft_videos' + `/${DraftKingsName}.mp4`,
            ),
          )
        ) {
          file = fs.readFileSync(
            path.join(
              __dirname,
              '../../../nft_videos' + `/${DraftKingsName}.mp4`,
            ),
          );
          name = DraftKingsName;
        }

        if (file) {
          const uploaded = await this.s3Storage.uplaodNftVideo(file, name);

          const nft = await this.nftModel.findOne({
            playerId: player.PlayerID,
          });
          nft.meta.videoUrl =
            'https://d2pm667mw7y58b.cloudfront.net/' +
            uploaded.url.split('com/')[1];
          nft.value = 20;
          nft.status = true;

          await this.nftModel.updateOne({ _id: nft._id }, nft);

          if (uploaded.url && uploaded.url.length > 0) {
            fs.appendFileSync(
              path.join(__dirname, '../../../nft_import_log.txt'),
              `\n${index + 1} / ${players.length}`,
            );

            fs.appendFileSync(
              path.join(__dirname, '../../../nft_import_log.txt'),
              `\nNFT video imported for playerID: ${player.PlayerID}`,
            );
          }
        } else {
          fs.appendFileSync(
            path.join(__dirname, '../../../nft_import_log.txt'),
            '\nVideo not found for this player',
          );

          fs.appendFileSync(
            path.join(__dirname, '../../../nft_import_log.txt'),
            `\n${index + 1} / ${players.length}`,
          );
        }
      }
    } catch (error) {
      console.log(error.message);
      fs.appendFileSync(
        path.join(__dirname, '../../../nft_import_log.txt'),
        `\n${error.message}`,
      );
    }
  }

  async import() {
    const players = await this.playerModel.find();
    this.importCall(players);
    return 'Importing nft videos';
  }

  async ownershipTransfer(nft, quantity, receiverAddress: string) {
    console.log('nft: ', nft);
    console.log('quantity: ', quantity);
    console.log('receiverAddress: ', receiverAddress);

    try {
      for (let index = 0; index < nft.mintedIds.length; index++) {
        const mintedNftId = nft.mintedIds[index];

        const data = {
          nftId: mintedNftId.id,
          quantity: +quantity,
          receiverAddress,
          signerAddress: process.env.SIGNER_ADDRESS,
          signerName: process.env.SIGNER_NAME,
        };

        const url = `${process.env.CARDANO_NODE}/nft/transfer`;
        await axios.post(url, data);
      }

      return {
        message: 'Successfully updated',
      };
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException('Error on minter server');
    }
  }

  async transferByOwnerToBuyer(payload, user) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      let isMintedByMe: boolean;
      try {
        const { nftId, ownerAddress, buyerAddress, quantity, blockChainNftId } =
          payload;

        let recordId = new Types.ObjectId(nftId);

        const nft = await this.userAndMintedNftModel.findOne(
          {
            _id: recordId,
            walletAddress: ownerAddress,
          },
          null,
          { session },
        );

        if (nft) {
          isMintedByMe = nft.userId == user._id.toString();

          // Seller
          const res = await this.ownershipTransfer(nft, quantity, buyerAddress);

          nft.activeMarketplace = false;
          nft.available = nft.count - quantity;
          nft.count = nft.available;
          nft.listingPrice = 0;

          await nft.save();

          if (nft.available <= 0) {
            await this.userAndMintedNftModel.deleteOne(
              {
                _id: new Types.ObjectId(nft._id),
              },
              { session },
            );
          }

          await this.mintedNftBiddingModel.deleteMany(
            {
              mintedNftId: new Types.ObjectId(nft._id),
            },
            { session },
          );

          if (res.message === 'Successfully updated') {
            nft.available = quantity;
            nft.count = quantity;
            nft.activeMarketplace = false;
            nft.isPurchased = false;
            nft.walletAddress = buyerAddress;
            nft.listingPrice = 0;
            nft.listingCount = 0;
            nft.userId = user._id;
            nft.mintedIds = [
              {
                quantity,
                id: blockChainNftId,
              },
            ];

            // Buyer
            let existing = nft;
            let dbObjectJSON = existing.toJSON();
            dbObjectJSON.count = quantity;
            dbObjectJSON.available = quantity;
            delete dbObjectJSON._id;

            await this.userAndMintedNftModel.create(dbObjectJSON);

            this.gatewayService.emit(
              {
                type: SOCKET_TYPES.NFT_OWNERSHIP_TRANSFER,
                data: {
                  _id: nft._id,
                  count: nft.available,
                  transfer: true,
                  success: true,
                  isMintedByMe,
                  userEmail: user.email,
                },
              },
              SOCKET_TYPES.NFT_OWNERSHIP_TRANSFER,
            );

            return {
              status: 201,
              message: 'Nft purchased successfully!',
            };
          }
        } else {
          throw new BadRequestException('Nft not found');
        }
      } catch (error) {
        // console.log(error);

        // this.gatewayService.emit(
        //   {
        //     type: SOCKET_TYPES.ACTIVE_MARKETPLACE,
        //     data: {
        //       isMintedByMe,
        //       success: false,
        //     },
        //   },
        //   SOCKET_TYPES.ACTIVE_MARKETPLACE,
        // );

        throw new BadRequestException(error.message);
      }
    });

    session.endSession();
  }

  async transferByOwnerToBuyerInstant(payload, user) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      let isMintedByMe: boolean;
      try {
        const { nftId, ownerAddress, buyerAddress, quantity, blockChainNftId } =
          payload;

        let recordId = new Types.ObjectId(nftId);

        const nft = await this.userAndMintedNftModel.findOne(
          {
            _id: recordId,
            walletAddress: ownerAddress,
          },
          null,
          { session },
        );

        if (nft) {
          isMintedByMe = nft.userId == user._id.toString();

          // Seller
          const res = await this.ownershipTransfer(nft, quantity, buyerAddress);

          nft.activeMarketplace = false;
          nft.available = nft.count - quantity;
          nft.count = nft.available;
          nft.listingPrice = 0;

          await nft.save();

          if (nft.available <= 0) {
            await this.userAndMintedNftModel.deleteOne(
              {
                _id: new Types.ObjectId(nft._id),
              },
              { session },
            );
          }

          await this.mintedNftBiddingModel.deleteMany(
            {
              mintedNftId: new Types.ObjectId(nft._id),
            },
            { session },
          );

          if (res.message === 'Successfully updated') {
            nft.available = quantity;
            nft.count = quantity;
            nft.activeMarketplace = false;
            nft.isPurchased = false;
            nft.walletAddress = buyerAddress;
            nft.listingPrice = 0;
            nft.userId = user._id;
            nft.mintedIds = [
              {
                quantity,
                id: blockChainNftId,
              },
            ];

            // Buyer
            let existing = nft;
            let dbObjectJSON = existing.toJSON();
            dbObjectJSON.count = quantity;
            dbObjectJSON.available = quantity;
            delete dbObjectJSON._id;

            await this.userAndMintedNftModel.create(dbObjectJSON);

            this.gatewayService.emit(
              {
                type: SOCKET_TYPES.NFT_OWNERSHIP_TRANSFER,
                data: {
                  _id: nft._id,
                  count: nft.available,
                  transfer: true,
                  success: true,
                  isMintedByMe,
                  userEmail: user.email,
                },
              },
              SOCKET_TYPES.NFT_OWNERSHIP_TRANSFER,
            );

            return {
              status: 201,
              message: 'Nft purchased successfully!',
            };
          }
        } else {
          throw new BadRequestException('Nft not found');
        }
      } catch (error) {
        // console.log(error);

        // this.gatewayService.emit(
        //   {
        //     type: SOCKET_TYPES.ACTIVE_MARKETPLACE,
        //     data: {
        //       isMintedByMe,
        //       success: false,
        //     },
        //   },
        //   SOCKET_TYPES.ACTIVE_MARKETPLACE,
        // );

        throw new BadRequestException(error.message);
      }
    });

    session.endSession();
  }
}
