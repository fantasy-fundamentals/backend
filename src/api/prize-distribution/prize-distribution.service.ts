import * as mongoose from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NftDocument, NftEntity } from 'src/database/entities/nft.entity';
import {
  UserAndMintedNftDocument,
  UserAndMintedNftEntity,
} from 'src/database/entities/user-and-minted-nfts.entity';
import {
  PlayerDocument,
  PlayerEntity,
} from 'src/database/entities/player.entity';
import {
  PositionDocument,
  PositionEntity,
} from 'src/database/entities/position.entity';
import { GameLog, GameLogDocument } from 'src/database/entities/gameLog.entity';
import { AdminDocument, AdminEntity } from 'src/database/entities/admin.entity';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class PrizeDistributionService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,

    @InjectModel(UserAndMintedNftEntity.name)
    private readonly userAndMintedNftModel: Model<UserAndMintedNftDocument>,
    @InjectModel(NftEntity.name)
    private readonly nftModel: Model<NftDocument>,

    @InjectModel(AdminEntity.name) private readonly adminModel: Model<AdminDocument>,
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerDocument>,

    @InjectModel(PositionEntity.name)
    private readonly positionModel: Model<PositionDocument>,

    @InjectModel(GameLog.name)
    private readonly gameLogModel: Model<GameLogDocument>,
  ) {}

  async distributePrizeQB(week) {
    let nftToReward = [];
    let nftToDeduct = [];

    // const session = await this.connection.startSession();

    // await session.withTransaction(async () => {
    try {
      let playersQB = await this.playerModel
        .find(
          { 'detail.Position': 'QB', isMinted: true },
          {
            detail: 0,
            games: 0,
            fantasyData: 0,
          },
        )
        .sort({ rating: -1 });

      let qbPrizePositions = await this.positionModel.findOne({
        title: 'QB',
      });

      if (qbPrizePositions) {
        let winnerQBPlayers = playersQB.slice(0, qbPrizePositions.winStages);

        let loserQBPlayers = playersQB.slice(
          qbPrizePositions.winStages,
          playersQB.length,
        );

        // deduct losing players minted nft
        var totalLosersValuation = 0;

        for (let index = 0; index < loserQBPlayers.length; index++) {
          let player = loserQBPlayers[index];
          let nft = await this.nftModel.findOne({
            playerId: player.playerId,
          });

          if (nft) {
            const amountToDeduct =
              (nft.value * qbPrizePositions.losersDeductionPercentage) / 100;
            totalLosersValuation = totalLosersValuation + amountToDeduct;

            await this.nftModel.findOneAndUpdate(
              { playerId: player.playerId },
              {
                $inc: { value: -amountToDeduct },
                lastValue: nft.value,
              },
              // { session },
            );

            nftToDeduct.push(nft);
          }
        }

        console.log(totalLosersValuation);

        // reward winning players minted nft
        const profitDistributionQB = [41, 25, 16, 8, 8];

        for (let index = 0; index < winnerQBPlayers.length; index++) {
          let player = winnerQBPlayers[index];
          let nft = await this.nftModel.findOne({
            playerId: player.playerId,
          });

          if (nft) {
            let amountToCredit =
              (totalLosersValuation * profitDistributionQB[index]) / 100;

            await this.nftModel.findOneAndUpdate(
              { playerId: player.playerId },
              {
                $inc: { value: amountToCredit },
                lastValue: +nft.value,
              },
              // { session },
            );

            console.log(amountToCredit);

            if (typeof player.won === 'undefined') {
              player.won = 0;
            }
            player.won = player.won + 1;

            await player.save();

            nftToReward.push(nft);
          }
        }
        console.log('QB synced!');

        await this.gameLogModel.create({
          week,
          winningAmount: +totalLosersValuation,
          position: 'QB',
        });
        // session.endSession();
      }
      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
    // });
    // session.endSession();
  }


  async distributePrize(position,week) {
    let nftToReward = [];
    let nftToDeduct = [];

    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
    try {
      let players = await this.playerModel
        .find(
          { 'detail.Position': position, isMinted: true },
          {
            detail: 0,
            games: 0,
            fantasyData: 0,
          },
        )
        .sort({ rating: -1 });

      let prizePositions = await this.positionModel.findOne({
        title: position,
      });

      if (prizePositions) {
        let { winStages, losersDeductionPercentage, winPercentages, adminFeePercentage } = prizePositions;
        let winnerPlayers = players.slice(0, winStages);

        let loserPlayers = players.slice(
          winStages,
          players.length,
        );

        // deduct losing players minted nft
        var totalLosersValuation = 0;

        await Promise.allSettled(loserPlayers.map(async (player) => {
          let nft = await this.nftModel.findOne({
            playerId: player.playerId,
          });

          if (nft) {
            const amountToDeduct =
              (nft.value * losersDeductionPercentage) / 100;
            totalLosersValuation = totalLosersValuation + amountToDeduct;

            nft.lastValue = nft.value;
            nft.value = nft.value - amountToDeduct;
            await nft.save();

            nftToDeduct.push(nft);
          }

        }));

        // reward winning players minted nft
        const profitDistributionQB = winPercentages;

        const adminFee = adminFeePercentage;
        let adminProfit = (totalLosersValuation) * (adminFee)/100;
        totalLosersValuation = totalLosersValuation - adminProfit;
        losersDeductionPercentage = losersDeductionPercentage - (adminFee/100);


        await Promise.allSettled(winnerPlayers.map(async (player, index) => {
        
          let nft = await this.nftModel.findOne({
            playerId: player.playerId,
          });

          if (nft) {
            let amountToCredit = (profitDistributionQB[index]/losersDeductionPercentage) * totalLosersValuation;

            nft.lastValue = nft.value;
            nft.value = nft.value + amountToCredit;
            await nft.save();

            if (typeof player.won === 'undefined') {
              player.won = 0;
            }
            player.won = player.won + 1;

            await player.save();

            nftToReward.push(nft);
          }
        
        }))


        const admin = await this.adminModel.findOne({role: Role.ADMIN});
        if(admin){
          admin.profitBalance = admin.profitBalance + adminProfit;
          await admin.save(
            {session}
            );
        }



        console.log(position+' synced!');

        await this.gameLogModel.create({
          week,
          winningAmount: +totalLosersValuation,
          position: position,
        });
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
    });
    session.endSession();
    return true;
  }

  async distributePrizeWR(week) {
    let nftToReward = [];
    let nftToDeduct = [];

    // const session = await this.connection.startSession();

    // await session.withTransaction(async () => {
    try {
      let playersWR = await this.playerModel
        .find(
          { 'detail.Position': 'WR', isMinted: true },
          {
            detail: 0,
            games: 0,
            fantasyData: 0,
          },
        )
        .sort({ rating: -1 });

      let wrPrizePositions = await this.positionModel.findOne({
        title: 'WR',
      });

      if (wrPrizePositions) {
        let winnerWRPlayers = playersWR.slice(0, wrPrizePositions.winStages);

        let loserWRPlayers = playersWR.slice(
          wrPrizePositions.winStages,
          playersWR.length,
        );

        // deduct losing players minted nft
        var totalLosersValuation = 0;

        for (let index = 0; index < loserWRPlayers.length; index++) {
          let player = loserWRPlayers[index];
          let nft = await this.nftModel.findOne({
            playerId: player.playerId,
          });

          if (nft) {
            const amountToDeduct =
              (nft.value * wrPrizePositions.losersDeductionPercentage) / 100;

            totalLosersValuation = totalLosersValuation + amountToDeduct;

            await this.nftModel.findOneAndUpdate(
              { playerId: player.playerId },
              {
                $inc: { value: -amountToDeduct },
                lastValue: nft.value,
              },
              // { session },
            );

            nftToDeduct.push(nft);
          }
        }

        // reward winning players minted nft
        const profitDistributionWR = [
          0.14, 0.12, 0.1, 0.08, 0.08, 0.06, 0.06, 0.06, 0.06, 0.06, 0.04, 0.04,
          0.04, 0.04, 0.02,
        ];

        for (let index = 0; index < winnerWRPlayers.length; index++) {
          let player = winnerWRPlayers[index];
          let nft = await this.nftModel.findOne({
            playerId: player.playerId,
          });

          if (nft) {
            let amountToCredit =
              (totalLosersValuation * profitDistributionWR[index]) / 100;

            await this.nftModel.findOneAndUpdate(
              { playerId: player.playerId },
              {
                $inc: { value: amountToCredit },
                lastValue: nft.value,
              },
              // { session },
            );

            if (typeof player.won === 'undefined') {
              player.won = 0;
            }
            player.won = player.won + 1;

            await player.save();

            nftToReward.push(nft);
          }
        }
        console.log('WR synced!');
        await this.gameLogModel.create({
          week,
          winningAmount: +totalLosersValuation,
          position: 'WR',
        });
        // session.endSession();
      }

      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
    // });
    // session.endSession();
  }

  async distributePrizeRB(week) {
    let nftToReward = [];
    let nftToDeduct = [];

    // const session = await this.connection.startSession();

    // await session.withTransaction(async () => {
    try {
      let playersRB = await this.playerModel
        .find(
          { 'detail.Position': 'RB', isMinted: true },
          {
            detail: 0,
            games: 0,
            fantasyData: 0,
          },
        )
        .sort({ rating: -1 });

      let rbPrizePositions = await this.positionModel.findOne({
        title: 'RB',
      });

      if (rbPrizePositions) {
        let winnerRBPlayers = playersRB.slice(0, rbPrizePositions.winStages);

        let loserRBPlayers = playersRB.slice(
          rbPrizePositions.winStages,
          playersRB.length,
        );

        // deduct losing players minted nft
        var totalLosersValuation = 0;

        for (let index = 0; index < loserRBPlayers.length; index++) {
          let player = loserRBPlayers[index];
          let nft = await this.nftModel.findOne({
            playerId: player.playerId,
          });

          if (nft) {
            const amountToDeduct =
              (nft.value * rbPrizePositions.losersDeductionPercentage) / 100;
            totalLosersValuation = totalLosersValuation + amountToDeduct;

            await this.nftModel.findOneAndUpdate(
              { playerId: player.playerId },
              {
                $inc: { value: -amountToDeduct },
                lastValue: nft.value,
              },
              // { session },
            );

            nftToDeduct.push(nft);
          }
        }

        // reward winning players minted nft
        const profitDistributionRB = [
          0.25, 0.1875, 0.15, 0.125, 0.1, 0.0625, 0.0625, 0.0625,
        ];

        for (let index = 0; index < winnerRBPlayers.length; index++) {
          let player = winnerRBPlayers[index];
          let nft = await this.nftModel.findOne({
            playerId: player.playerId,
          });

          if (nft) {
            let amountToCredit =
              (totalLosersValuation * profitDistributionRB[index]) / 100;

            await this.nftModel.findOneAndUpdate(
              { playerId: player.playerId },
              {
                $inc: { value: amountToCredit },
                lastValue: nft.value,
              },
              // { session },
            );

            if (typeof player.won === 'undefined') {
              player.won = 0;
            }
            player.won = player.won + 1;

            await player.save();

            nftToReward.push(nft);
          }
        }

        console.log('RB synced!');

        await this.gameLogModel.create({
          week,
          winningAmount: +totalLosersValuation,
          position: 'RB',
        });
        // session.endSession();
      }
      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
    // });
    // session.endSession();
  }

  async distributePrizeTE(week) {
    let nftToReward = [];
    let nftToDeduct = [];

    // const session = await this.connection.startSession();

    // await session.withTransaction(async () => {
    try {
      let playersTE = await this.playerModel
        .find(
          {
            'detail.Position': 'TE',
            isMinted: true,
          },
          { games: false, fantasyData: false, detail: false },
        )
        .sort({ rating: -1 });

      // for (let index = 0; index < playersTE.length; index++) {
      //   let player = playersTE[index];

      //   var nft = await this.nftModel.findOne({
      //     playerId: player.playerId,
      //   });

      //   player.rating = nft ? nft.rating : 0;

      //   await player.save();
      // }

      let tePrizePositions = await this.positionModel.findOne({
        title: 'TE',
      });

      console.log(tePrizePositions);

      if (tePrizePositions) {
        // var tempWinners = playersTE
        //   .sort((a, b) => a.rating - b.rating)
        //   .reverse();

        let winnerTEPlayers = playersTE.slice(0, tePrizePositions.winStages);

        let loserTEPlayers = playersTE.slice(
          tePrizePositions.winStages,
          playersTE.length,
        );

        // deduct losing players minted nft
        var totalLosersValuation = 0;

        for (let index = 0; index < loserTEPlayers.length; index++) {
          let player = loserTEPlayers[index];
          let nft = await this.nftModel.findOne({
            playerId: player.playerId,
          });

          if (nft) {
            const amountToDeduct =
              (nft.value * tePrizePositions.losersDeductionPercentage) / 100;
            totalLosersValuation += amountToDeduct;

            await this.nftModel.findOneAndUpdate(
              { playerId: player.playerId },
              {
                $inc: { value: -amountToDeduct },
                lastValue: nft.value,
              },
              // { session },
            );

            nftToDeduct.push(nft);
          }
        }

        // reward winning players minted nft
        const profitDistributionTE = [0.5, 0.3, 0.2];

        for (let index = 0; index < winnerTEPlayers.length; index++) {
          console.log('index: ', index);

          let player = winnerTEPlayers[index];
          let nft = await this.nftModel.findOne({
            playerId: player.playerId,
          });

          if (nft) {
            let amountToCredit =
              (totalLosersValuation * profitDistributionTE[index]) / 100;

            await this.nftModel.findOneAndUpdate(
              { playerId: player.playerId },
              {
                $inc: { value: amountToCredit },
                lastValue: nft.value,
              },
              // { session },
            );

            if (typeof player.won === 'undefined') {
              player.won = 0;
            }
            player.won = player.won + 1;

            await player.save();

            nftToReward.push(nft);
          }
        }

        console.log('TE synced!');
        await this.gameLogModel.create({
          week,
          winningAmount: +totalLosersValuation,
          position: 'TE',
        });
        // session.endSession();
      }

      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
    // });
    // session.endSession();
  }

  async syncRankingRB() {
    const nfts = await this.nftModel.find({ 'playerDetail.Position': 'RB' });

    // let lastWeek = await axios.get(
    //   `https://api.sportsdata.io/v3/nfl/scores/json/LastCompletedWeek?key=${process.env.SPORTS_API}`,
    // );

    // var week = lastWeek.data;

    // const nftRate = await axios.get(
    //   `https://api.sportsdata.io/v3/nfl/stats/json/FantasyPlayers?key=${process.env.SPORTS_API}`,
    // );

    for (let index = 0; index < nfts.length; index++) {
      let element = nfts[index];

      // const playerRating = nftRate.data.filter(
      //   (e: any) => e.PlayerID === element.playerId,
      // );

      // const rating = playerRating[0]
      //   ? playerRating[0].ProjectedFantasyPoints
      //   : 0;

      var tempRating = Math.floor(Math.random() * 90000) + 10000;

      var historicalRating = element.historicalRating ? [] : [];
      historicalRating.push({ week: 7, rating: tempRating });

      await this.nftModel.findByIdAndUpdate(element._id, {
        rating: tempRating,
        historicalRating,
      });

      var p = await this.playerModel.findOneAndUpdate(
        { playerId: element.playerId },
        {
          rating: tempRating,
          historicalRating,
        },
      );

      console.log(index + 1);
    }

    this.distributePrizeRB(6);
  }

  async syncRankingQB() {
    const nfts = await this.nftModel.find({ 'playerDetail.Position': 'QB' });

    // let lastWeek = await axios.get(
    //   `https://api.sportsdata.io/v3/nfl/scores/json/LastCompletedWeek?key=${process.env.SPORTS_API}`,
    // );

    // var week = lastWeek.data;

    // const nftRate = await axios.get(
    //   `https://api.sportsdata.io/v3/nfl/stats/json/FantasyPlayers?key=${process.env.SPORTS_API}`,
    // );

    for (let index = 0; index < nfts.length; index++) {
      let element = nfts[index];

      // const playerRating = nftRate.data.filter(
      //   (e: any) => e.PlayerID === element.playerId,
      // );

      // const rating = playerRating[0]
      //   ? playerRating[0].ProjectedFantasyPoints
      //   : 0;

      var tempRating = Math.floor(Math.random() * 90000) + 10000;

      var historicalRating = element.historicalRating ? [] : [];
      historicalRating.push({ week: 7, rating: tempRating });

      await this.nftModel.findByIdAndUpdate(element._id, {
        rating: tempRating,
        historicalRating,
      });

      var p = await this.playerModel.findOneAndUpdate(
        { playerId: element.playerId },
        {
          rating: tempRating,
          historicalRating,
        },
      );

      console.log(index + 1);
    }

    this.distributePrizeQB(7);
  }

  async syncRanking(position,week) {
    const nfts = await this.nftModel.find({ 'playerDetail.Position': position });

    await Promise.allSettled(nfts.map(async( element) => {

      var tempRating = Math.floor(Math.random() * 90000) + 10000;

      var historicalRating = element.historicalRating ? [] : [];
      historicalRating.push({ week: week, rating: tempRating });

      await this.nftModel.findByIdAndUpdate(element._id, {
        rating: tempRating,
        historicalRating,
      });

      var p = await this.playerModel.findOneAndUpdate(
        { playerId: element.playerId },
        {
          rating: tempRating,
          historicalRating,
        },
      );
    }))

    this.distributePrize(position,week);
  }



  async syncRankingTE() {
    const nfts = await this.nftModel.find({ 'playerDetail.Position': 'TE' });

    // let lastWeek = await axios.get(
    //   `https://api.sportsdata.io/v3/nfl/scores/json/LastCompletedWeek?key=${process.env.SPORTS_API}`,
    // );

    // var week = lastWeek.data;

    // const nftRate = await axios.get(
    //   `https://api.sportsdata.io/v3/nfl/stats/json/FantasyPlayers?key=${process.env.SPORTS_API}`,
    // );

    for (let index = 0; index < nfts.length; index++) {
      let element = nfts[index];

      // const playerRating = nftRate.data.filter(
      //   (e: any) => e.PlayerID === element.playerId,
      // );

      // const rating = playerRating[0]
      //   ? playerRating[0].ProjectedFantasyPoints
      //   : 0;

      var tempRating = Math.floor(Math.random() * 90000) + 10000;

      var historicalRating = element.historicalRating ? [] : [];
      historicalRating.push({ week: 6, rating: tempRating });

      await this.nftModel.findByIdAndUpdate(element._id, {
        rating: tempRating,
        historicalRating,
      });

      var p = await this.playerModel.findOneAndUpdate(
        { playerId: element.playerId },
        {
          rating: tempRating,
          historicalRating,
        },
      );

      console.log(index + 1);
    }

    this.distributePrizeTE(6);
  }

  async syncRankingWR() {
    const nfts = await this.nftModel.find({ 'playerDetail.Position': 'WR' });

    // let lastWeek = await axios.get(
    //   `https://api.sportsdata.io/v3/nfl/scores/json/LastCompletedWeek?key=${process.env.SPORTS_API}`,
    // );

    // var week = lastWeek.data;

    // const nftRate = await axios.get(
    //   `https://api.sportsdata.io/v3/nfl/stats/json/FantasyPlayers?key=${process.env.SPORTS_API}`,
    // );

    for (let index = 0; index < nfts.length; index++) {
      let element = nfts[index];

      // const playerRating = nftRate.data.filter(
      //   (e: any) => e.PlayerID === element.playerId,
      // );

      // const rating = playerRating[0]
      //   ? playerRating[0].ProjectedFantasyPoints
      //   : 0;

      var tempRating = Math.floor(Math.random() * 90000) + 10000;

      var historicalRating = element.historicalRating ? [] : [];
      historicalRating.push({ week: 6, rating: tempRating });

      await this.nftModel.findByIdAndUpdate(element._id, {
        rating: tempRating,
        historicalRating,
      });

      var p = await this.playerModel.findOneAndUpdate(
        { playerId: element.playerId },
        {
          rating: tempRating,
          historicalRating,
        },
      );

      console.log(index + 1);
    }

    this.distributePrizeWR(6);
  }

  async distributionRB() {
    this.syncRankingRB();

    return {
      status: 201,
      message: 'Prize distribution started of RB!',
    };
  }

  async distributionQB() {
    this.syncRankingQB();

    return {
      status: 201,
      message: 'Prize distribution started of QB!',
    };
  }

  async distributionTE() {
    this.syncRankingTE();

    return {
      status: 201,
      message: 'Prize distribution started of TE!',
    };
  }

  async distributionWR() {
    this.syncRankingWR();

    return {
      status: 201,
      message: 'Prize distribution started of WR!',
    };
  }
}
