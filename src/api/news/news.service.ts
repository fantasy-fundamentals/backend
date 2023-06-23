import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewsDocument, NewsEntity } from 'src/database/entities/news.entity';
import axios from 'axios';
import {
  DEFAULT_PAGINATION_LIMIT,
  PaginationDto,
} from 'src/shared/DTOs/paginated-page-limit.dto';
import { UpdateNewsDTO } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(NewsEntity.name)
    private readonly newsModel: Model<NewsDocument>,
  ) {}

  async sync() {
    try {
      const news = await axios.get(
        `https://api.sportsdata.io/v3/nfl/scores/json/News?key=${process.env.SPORTS_API}`,
      );

      for (let index = 0; index < news.data.length; index++) {
        const element = news.data[index];

        let imgArray = [
          'https://d2pm667mw7y58b.cloudfront.net/nft/NFT/1b1e5721-7c51-4ed8-ab9d-cf6850abc0e4',
          'https://d2pm667mw7y58b.cloudfront.net/nft/NFT/191dd54b-6c5c-4e49-9b49-e60af7b1b888',
          'https://d2pm667mw7y58b.cloudfront.net/nft/NFT/46e0dcfa-cef2-49eb-b56e-5ed0df5a47f4',
          'https://d2pm667mw7y58b.cloudfront.net/nft/NFT/45c78c56-25f4-4985-9d08-c042afa054ab',
          'https://d2pm667mw7y58b.cloudfront.net/nft/NFT/b2e7d743-a050-4241-af97-8d25507d77b9',
          'https://d2pm667mw7y58b.cloudfront.net/nft/NFT/a30807c5-f3e0-4870-bbfe-8d20b03f4aaa',
          'https://d2pm667mw7y58b.cloudfront.net/nft/NFT/021ace24-fc67-41fe-ac80-4735654a5c98',
          'https://d2pm667mw7y58b.cloudfront.net/nft/NFT/191dd54b-6c5c-4e49-9b49-e60af7b1b888',
          'https://d2pm667mw7y58b.cloudfront.net/nft/NFT/b2e7d743-a050-4241-af97-8d25507d77b9',
        ];

        var rand = imgArray[(Math.random() * imgArray.length) | 0];

        await this.newsModel.findOneAndUpdate(
          { newsId: element.NewsID },
          {
            playerId: element.NewsID,
            detail: element,
            coverImage: rand,
            slug: element.Title.toLowerCase().replace(/\W+/g, '-'),
          },
          { upsert: true },
        );
      }

      return {
        messsage: 'News data synced successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getNews({
    page,
    limit,
  }): Promise<{ data: NewsDocument[]; total: number }> {
    try {
      return {
        data: await this.newsModel
          .find()
          .sort({ createdAt: 'descending' })
          .skip(+page * +limit)
          .limit(+limit),
        total: await this.newsModel.countDocuments(),
      };
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Internal Server Error');
    }
  }

  async getNewsById(slug: string) {
    try {
      return await this.newsModel.findOne({ slug });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('News article not found!');
    }
  }

  async getRecentNewsByLimit(
    query: PaginationDto,
  ): Promise<{ data: NewsDocument[] }> {
    const trutyLimit = query.limit || DEFAULT_PAGINATION_LIMIT;
    const data = await this.newsModel
      .find()
      .sort({ createdAt: 'descending' })
      .limit(trutyLimit);
    return { data };
  }

  async update(newsId: string, payload: UpdateNewsDTO) {
    payload.coverImage =
      'https://d2pm667mw7y58b.cloudfront.net/' +
      payload.coverImage.split('com/')[1];
    await this.newsModel.findByIdAndUpdate(newsId, payload);
    return {
      status: 201,
      message: 'News updated successfully',
    };
  }
}
