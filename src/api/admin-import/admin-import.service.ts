import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AdminImportDocument,
  AdminImportEntity,
} from 'src/database/entities/admin-import.entity';

var xlsx = require('node-xlsx');

@Injectable()
export class AdminImportService {
  constructor(
    @InjectModel(AdminImportEntity.name)
    private readonly adminImportModel: Model<AdminImportDocument>,
  ) {}

  async getAll() {
    try {
      const recentFile = await this.adminImportModel
        .find()
        .sort({
          createdAt: 'desc',
        })
        .limit(1);

      return {
        columns: [
          'Confidence',
          'Season',
          'Week',
          'Favorite',
          'Underdog',
          'Favorite Score',
          'Underdog Score',
          'THE PLAY',
          'Market OPEN',
          'OUR Line',
          'Difference',
          'Bet Result',
        ],
        data: recentFile.length > 0 ? recentFile[0].data : [],
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async importData(withoutColumns: any) {
    const data = [];

    for (let index = 0; index < withoutColumns.length; index++) {
      const element = withoutColumns[index];
      data.push(element);
    }

    await this.adminImportModel.create({ data });
  }

  async import(file) {
    try {
      var obj = xlsx.parse(file.buffer);
      const data = obj[0]['data'];
      const columns = data.shift();
      const columns1 = data.shift();
      this.importData(data);

      return 'Importing is in progress...';
    } catch (e) {
      throw e;
    }
  }
}
