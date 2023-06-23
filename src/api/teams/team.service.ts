import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamDocument, TeamEntity } from 'src/database/entities/team.entity';
import axios from 'axios';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(TeamEntity.name)
    private readonly teamModal: Model<TeamDocument>,
  ) { }

  async sync() {
    try {
      const teams = await axios.get(
        `https://api.sportsdata.io/v3/nfl/scores/json/Teams?key=${process.env.SPORTS_API}`,
      );

      for (let index = 0; index < teams.data.length; index++) {
        const element = teams.data[index];

        await this.teamModal.findOneAndUpdate(
          { teamId: element.TeamID },
          { teamId: element.TeamID, detail: element },
          { upsert: true },
        );
      }

      return {
        messsage: 'Teams data synced successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getTeams({ page, limit }): Promise<{ data: TeamDocument[], total: number }> {
    try {
      return {
        data: await this.teamModal
          .find()
          .skip(+page * +limit)
          .limit(+limit),
        total: await this.teamModal.countDocuments()
      };
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Internal Server Error');
    }
  }
}
