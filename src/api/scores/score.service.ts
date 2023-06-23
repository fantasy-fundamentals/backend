import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScoreDocument, ScoreEntity } from 'src/database/entities/score.entity';
import axios from 'axios';
import { FilterScoreWithPaginationDto } from './dto/filter-score.dto';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
} from 'src/shared/DTOs/paginated-page-limit.dto';
//

@Injectable()
export class ScoreService {
  constructor(
    @InjectModel(ScoreEntity.name)
    private readonly scoreModal: Model<ScoreDocument>,
  ) {}

  async getCurrentSeason() {
    const season = await axios.get(
      `https://api.sportsdata.io/v3/nfl/scores/json/CurrentSeason?key=${process.env.SPORTS_API}`,
    );

    return season?.data;
  }

  async sync() {
    try {
      const season = await this.getCurrentSeason();

      console.log(
        `https://api.sportsdata.io/v3/nfl/scores/json/Scores/${season}?key=${process.env.SPORTS_API}`,
      );

      const scores = await axios.get(
        `https://api.sportsdata.io/v3/nfl/scores/json/Scores/${season}?key=${process.env.SPORTS_API}`,
      );

      for (let index = 0; index < scores.data.length; index++) {
        const element = scores.data[index];

        await this.scoreModal.findOneAndUpdate(
          { gameKey: element.GameKey },
          { gameKey: element.GameKey, detail: element },
          { upsert: true },
        );
      }

      return {
        messsage: 'Scores data synced successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getScores(query: FilterScoreWithPaginationDto) {
    try {
      const page = query.page || DEFAULT_PAGINATION_PAGE;
      const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
      const skip = page * limit;
      const { upcoming } = query;

      let aggregationQuery: any = [
        {
          $addFields: {
            today: { $toDate: new Date() },
            eventDate: {
              $toDate: '$detail.DateTime',
            },
          },
        },
        {
          $addFields: {
            datedifference: {
              $dateDiff: {
                startDate: '$eventDate',
                endDate: '$today',
                unit: 'day',
              },
            },
          },
        },
        {
          $addFields: {
            isUpcoming: {
              $lt: ['$datedifference', 0],
            },
          },
        },
        {
          $match: {
            isUpcoming: upcoming,
          },
        },
      ];

      if (upcoming === true) {
        aggregationQuery = [
          ...aggregationQuery,
          {
            $sort: {
              'detail.DateTime': 1,
            },
          },
        ];
      } else {
        aggregationQuery = [
          ...aggregationQuery,
          {
            $sort: {
              'detail.DateTime': -1,
            },
          },
        ];
      }

      aggregationQuery = [
        ...aggregationQuery,
        {
          $project: {
            _id: 1,
            detail: 1,
            gameKey: 1,
            status: 1,
          },
        },
      ];

      return {
        data: await this.scoreModal.aggregate(aggregationQuery),
        total:
          (
            await this.scoreModal.aggregate([
              ...aggregationQuery,
              { $count: 'total' },
            ])
          )?.[0]?.total || 0,
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getCurrentWeek() {
    const week = await axios.get(
      `https://api.sportsdata.io/v3/nfl/scores/json/CurrentWeek?key=${process.env.SPORTS_API}`,
    );

    return week?.data;
  }
}
