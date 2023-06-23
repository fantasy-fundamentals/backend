import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ContactUs,
  ContactUsDocument,
} from 'src/database/entities/contact-us.entity';
import {
  NewsCategoryDocument,
  NewsCategoryEntity,
} from 'src/database/entities/newsCategory.entity';
import { EmailHandlerService } from '../email-handler/email-handler.service';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectModel(ContactUs.name)
    private readonly contactUsModel: Model<ContactUsDocument>,
    private readonly emailHandler: EmailHandlerService,
  ) {}

  async create(payload): Promise<object> {
    try {
      await this.contactUsModel.create(payload);
      await this.emailHandler.sendSupportNewTicketReceivedEmail();
      return {
        status: 201,
        message: 'Request created successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async get(): Promise<NewsCategoryDocument[]> {
    try {
      return await this.contactUsModel.find();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async update(id, payload): Promise<Object> {
    try {
      await this.contactUsModel.findByIdAndUpdate(id, payload);
      return {
        status: 201,
        message: 'Request updated successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async delete(_id): Promise<Object> {
    try {
      const found = await this.contactUsModel.findById({ _id });
      if (!found) {
        throw new BadRequestException('Request not found');
      }
      await this.contactUsModel.findByIdAndDelete(_id);
      return {
        status: 201,
        message: 'Request deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async status(payload): Promise<object> {
    let { id, active } = payload;

    try {
      await this.contactUsModel.findByIdAndUpdate(id, {
        active,
      });

      return {
        message: 'Request updated successfully!',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
