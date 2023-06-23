import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PlayerFavoriteEntity,
  PlayerFavoriteDocument,
} from 'src/database/entities/player-favorite.entity';
import {
  PlayerEntity,
  PlayerDocument,
} from 'src/database/entities/player.entity';
import { CoinsManagementController } from '../coins-management/coins-management.controller';
var ObjectId = require('mongodb').ObjectId;

@Injectable()
export class PlayerFavoriteService {
  constructor(
    @InjectModel(PlayerFavoriteEntity.name)
    private readonly playerFavoriteModel: Model<PlayerFavoriteDocument>,

    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerDocument>,
  ) {}

  async favorite(playerId, email, favorite) {
    var o_id = new ObjectId(playerId);

    if (favorite === 'false') {
      await this.playerFavoriteModel.findOneAndDelete({ player: o_id, email });
      return {
        message: 'Player has been removed as favorite!',
      };
    }
    const player = await this.playerModel.findById(o_id);

    const existing = await this.playerFavoriteModel.findOne({
      email,
      player: o_id,
    });

    if (existing) {
      return {
        message: 'Player already marked as favorite!',
      };
    }

    if (player && !existing) {
      await this.playerFavoriteModel.create({
        email,
        player: o_id,
      });

      return {
        message: 'Player has been marked as favorite!',
      };
    }
  }

  async get(email: string) {
    try {
      let data = await this.playerFavoriteModel
        .find({ email })
        .populate('player', '-games -fantasyData')
        .lean();
      data = data.map((d) => {
        const { player } = d;
        delete d.player;
        return {
          ...d,
          ...player,
          isFavorite: true,
        };
      });
      return data;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
