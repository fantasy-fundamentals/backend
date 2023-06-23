import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import {
  ProjectArticleDocument,
  ProjectArticleEntity,
} from 'src/database/entities/projectArticle.entity';
import { UpdateProjectArticleDTO } from './dto/projectArticle.dto';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
  PaginationDto,
} from 'src/shared/DTOs/paginated-page-limit.dto';

@Injectable()
export class ProjectArticleService {
  constructor(
    @InjectModel(ProjectArticleEntity.name)
    private readonly projectArticleModal: Model<ProjectArticleDocument>,
  ) {}

  async create(payload): Promise<object> {
    try {
      payload.slug = payload.title.toLowerCase().replace(/\W+/g, '-');
      await this.projectArticleModal.create(payload);
      return {
        messsage: 'Project article added successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async get(query: PaginationDto) {
    const page = query.page || DEFAULT_PAGINATION_PAGE;
    const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
    const skip = page * limit;

    const data = await this.projectArticleModal
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.projectArticleModal.countDocuments();

    return {
      data,
      total,
    };
  }

  async findById(slug: string): Promise<ProjectArticleDocument | null> {
    return await this.projectArticleModal.findOne({ slug });
  }

  async update(
    _id: string,
    payload: UpdateProjectArticleDTO,
  ): Promise<{ error: boolean; message: string }> {
    const foundProjectArticle = await this.projectArticleModal.findOne({ _id });

    if (!foundProjectArticle) {
      throw new NotFoundException('Project article not found');
    }

    payload.slug = !!payload.title
      ? payload.title.toLowerCase().replace(/\W+/g, '-')
      : foundProjectArticle.slug;
    await this.projectArticleModal.findByIdAndUpdate(
      _id,
      { ...payload },
      { upsert: true },
    );

    return {
      error: false,
      message: 'Project article updated successfully',
    };
  }

  async delete(id: string): Promise<{ error: boolean; message: string }> {
    const foundProjectArticle = await this.projectArticleModal.findById(id);
    if (!foundProjectArticle) {
      throw new NotFoundException('Project article not found');
    }

    await this.projectArticleModal.deleteOne({ _id: id });

    return {
      error: false,
      message: 'Project article deleted successfully',
    };
  }
}
