import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NewsLetterDocument,
  NewsLetter,
} from 'src/database/entities/newsletter.entity';
const XLSX = require('xlsx');
import { Readable } from 'stream';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(NewsLetter.name)
    private readonly newsletterModel: Model<NewsLetterDocument>,
  ) {}

  async create(payload): Promise<object> {
    try {
      await this.newsletterModel.create(payload);
      return {
        status: 201,
        message: 'Newsletter subscribed successfully',
      };
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Internal Server Error');
    }
  }

  async get(): Promise<NewsLetterDocument[]> {
    try {
      return await this.newsletterModel.find();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  bufferToStream(buffer) {
    let stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  async export(res) {
    const wallets = await this.newsletterModel.find({});
    const workbook = XLSX.utils.book_new();

    const temp = [];

    for (let index = 0; index < wallets.length; index++) {
      const element: any = wallets[index];

      temp.push(
        //@ts-ignore
        {
          //@ts-ignore
          Email: element.email,
        },
      );
    }

    const worksheet = XLSX.utils.json_to_sheet(temp);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'newsletter_export');

    const workbookOpts = { bookType: 'xlsx', type: 'buffer' };

    const resp = XLSX.write(workbook, workbookOpts);

    const stream = this.bufferToStream(resp);

    res.setHeader(
      'Content-disposition',
      `attachment; filename=Newsletter-Export.xlsx`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    stream.pipe(res);
  }
}
