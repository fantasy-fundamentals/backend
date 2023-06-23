import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BurnRequestDocument,
  BurnRequestEntity,
} from 'src/database/entities/burn-request.entity';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
  PaginationDto,
} from 'src/shared/DTOs/paginated-page-limit.dto';
import {
  BurnRequestChangeableStatus,
  BurnRequestStatus,
} from './burn-request-status.enum';
import { CreateBurnRequestDto } from './dto/burn-request.dto';
import { EmailHandlerService } from '../email-handler/email-handler.service';

@Injectable()
export class BurnRequestService {
  constructor(
    @InjectModel(BurnRequestEntity.name)
    private readonly burnRequestModel: Model<BurnRequestDocument>,
  ) {}

  async addRequest(body: CreateBurnRequestDto) {
    return await this.burnRequestModel.create(body);
  }

  async listAllRequests(query: PaginationDto) {
    const page = query.page || DEFAULT_PAGINATION_PAGE;
    const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
    const skip = page * limit;

    const data = await this.burnRequestModel
      .aggregate([
        {
          $lookup: {
            from: 'userentities',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            status: 1,
            walletAddress: 1,
            quantity: 1,
            listingPrice: 1,
            createdAt: 1,
            nft: {
              id: '$nftId',
              value: '$nftValue',
            },
            user: {
              email: '$user.email',
              name: '$user.name',
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ])
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data,
      total: await this.burnRequestModel.countDocuments(),
    };
  }

  async changeRequestStatus(
    burnRequestId: string,
    status: BurnRequestChangeableStatus,
  ) {
    const eitherRequestOrNull = await this.burnRequestModel.findOne({
      _id: burnRequestId,
    });

    if (eitherRequestOrNull === null) {
      throw new NotFoundException('Request not found');
    }

    if (status === BurnRequestChangeableStatus.Approved) {
      // logic of approved part
      eitherRequestOrNull.status = BurnRequestStatus.Approved;
    } else {
      // logic of rejected part
      eitherRequestOrNull.status = BurnRequestStatus.Rejected;
    }

    await eitherRequestOrNull.save();
    return {
      message: `Request ${
        status === BurnRequestChangeableStatus.Approved
          ? 'approved'
          : 'rejected'
      } successfully`,
    };
  }
}
