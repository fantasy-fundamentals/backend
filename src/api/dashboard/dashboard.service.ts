import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserAndMintedNftDocument,
  UserAndMintedNftEntity,
} from 'src/database/entities/user-and-minted-nfts.entity';
import { PlayerService } from '../players/player.service';
import { ShopService } from '../shop/shop.service';
import { UserService } from '../user/user.service';

@Injectable()
export class DashboardService {
  constructor(
    private playerSerivce: PlayerService,
    private shopService: ShopService,
    private userService: UserService,
    @InjectModel(UserAndMintedNftEntity.name)
    private readonly userAndMintedNftModel: Model<UserAndMintedNftDocument>,
  ) {}

  async getStats() {
    return {
      playersCount: await this.playerSerivce.getAllPlayersCount(),
      shopsCount: await this.shopService.getAllShopsCount(),
      usersCount: await this.userService.getAllUsersCount(),
    };
  }
}
