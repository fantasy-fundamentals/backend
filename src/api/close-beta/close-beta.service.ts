import { BadRequestException, Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CloseBetaDocument,
  CloseBetaEntity,
} from 'src/database/entities/close-beta.entity';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
  PaginationDto,
} from 'src/shared/DTOs/paginated-page-limit.dto';
import { CloseBetaDto } from './dto/close-beta.dto';

@Injectable()
export class CloseBetaService {
  constructor(
    @InjectModel(CloseBetaEntity.name)
    private readonly closeBetaModel: Model<CloseBetaDocument>,
  ) {}

  async isUserAlreadyRegisterForCloseBeta(userEmail: string) {
    const foundItem = await this.closeBetaModel.findOne({
      email: userEmail.trim().toLocaleLowerCase(),
    });
    return foundItem === null ? false : true;
  }

  async create(payload: CloseBetaDto): Promise<object> {
    if (await this.isUserAlreadyRegisterForCloseBeta(payload.email)) {
      throw new HttpException('You are already register for close beta!', 400);
    } else {
      await this.closeBetaModel.create(payload);
      return {
        status: 201,
        message: 'Register successfully for close beta!',
      };
    }
  }

  async get(
    query: PaginationDto,
  ): Promise<{ data: CloseBetaDocument[]; total: number }> {
    try {
      const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
      const page = query.page || DEFAULT_PAGINATION_PAGE;
      const skip = page * limit;

      return {
        data: await this.closeBetaModel.find({}).skip(skip).limit(limit),
        total: await this.closeBetaModel.countDocuments(),
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
