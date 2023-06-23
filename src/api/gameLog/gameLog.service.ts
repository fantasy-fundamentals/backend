import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameLog, GameLogDocument } from 'src/database/entities/gameLog.entity';

@Injectable()
export class GameLogService {
  constructor(
    @InjectModel(GameLog.name)
    private readonly gameLogModal: Model<GameLogDocument>,
  ) {}

  async adminGetAll() {
    try {
      return await this.gameLogModal.find();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}
