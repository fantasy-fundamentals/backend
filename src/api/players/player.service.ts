import {
  BadRequestException,
  Injectable,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  PlayerDocument,
  PlayerEntity,
} from 'src/database/entities/player.entity';
import axios from 'axios';
import { FilterPlayerWithPaginationDto } from './models/filter-player.dto';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
  PaginationDto,
} from 'src/shared/DTOs/paginated-page-limit.dto';
import { PlayerValueDto } from './models/player-value.dto';
import { NftService } from '../nft/nft.service';
import { NftDocument, NftEntity } from 'src/database/entities/nft.entity';
import {
  UserAndMintedNftDocument,
  UserAndMintedNftEntity,
} from 'src/database/entities/user-and-minted-nfts.entity';
var ObjectId = require('mongodb').ObjectId;

@Injectable()
export class PlayerService {
  constructor(
    private nftService: NftService,
    @InjectModel(PlayerEntity.name)
    private readonly playerModal: Model<PlayerDocument>,

    @InjectModel(NftEntity.name)
    private readonly nftModel: Model<NftDocument>,

    @InjectModel(UserAndMintedNftEntity.name)
    private readonly userAndMintedNftModel: Model<UserAndMintedNftDocument>,
  ) {
    // this.test();
  }

  async sync() {
    try {
      const gameStats = await axios.get(
        `https://api.sportsdata.io/v3/nfl/stats/json/FantasyPlayers?key=${process.env.SPORTS_API}`,
      );

      const players = await axios.get(
        `https://api.sportsdata.io/v3/nfl/scores/json/Players?key=${process.env.SPORTS_API}`,
      );

      const playerPositions = ['QB', 'WR', 'RB', 'TE'];

      for (let index = 0; index < players.data.length; index++) {
        const player = players.data[index];
        const isPlayerExist = await this.playerModal.findOne({
          playerId: parseInt(player.PlayerID),
        });

        const gamesRes23 = await axios.get(
          `https://api.sportsdata.io/v3/nfl/stats/json/PlayerGameStatsBySeason/2022/14536/all?key=${process.env.SPORTS_API}`,
        );

        const gamesRes22 = await axios.get(
          `https://api.sportsdata.io/v3/nfl/stats/json/PlayerGameStatsBySeason/2022/14536/all?key=${process.env.SPORTS_API}`,
        );

        const playerFantasyData = gameStats.data.find(
          (e: any) => +e.PlayerID === +player.PlayerID,
        );

        if (isPlayerExist != null) {
          isPlayerExist.detail = player;
          isPlayerExist.games = gamesRes23.data.concat(gamesRes22.data);
          isPlayerExist.fantasyData = playerFantasyData;

          await isPlayerExist.save();
        } else {
          if (playerPositions.includes(player.Position) === true)
            await this.playerModal.create({
              playerId: parseInt(player.PlayerID),
              detail: player,
              games: gamesRes23.data.concat(gamesRes22.data),
              fantasyData: playerFantasyData,
            });
        }
      }

      await this.nftService.sync();
      return true;
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Internal Server Error');
    }
  }

  async findById(id: string): Promise<PlayerDocument | null> {
    return this.playerModal.findOne({ _id: id });
  }

  async updateValue(id: string, body: PlayerValueDto) {
    if (await this.findById(id)) {
      const { value } = body;
      const updateResponse = await this.playerModal.updateOne(
        { _id: id },
        { value },
        { upsert: true },
      );
      if (updateResponse.modifiedCount === 1) {
        return {
          error: false,
          message: 'Value added successfully',
        };
      }
    } else {
      return {
        error: true,
        message: `Player with ID:${id} not found`,
      };
    }
  }

  async listAllForAuthenticatedUser(query: FilterPlayerWithPaginationDto) {
    // Pagination Related Variables
    const _limit = query.limit || DEFAULT_PAGINATION_LIMIT;
    const _page = query.page || DEFAULT_PAGINATION_PAGE;
    const skip = _page * _limit;

    // Fields that are matched using Regex
    const likeSearchFields = ['firstName', 'lastName'];

    // Object containing fields that define how data coming from FrontEnd would map to Mongo-Document
    var queryFiltersMappedObject = null;

    if (query.team !== 'all') {
      queryFiltersMappedObject = {
        playerId: 'playerId',
        firstName: 'detail.FirstName',
        lastName: 'detail.LastName',
        status: 'detail.Status',
        team: 'detail.Position',
      };
    } else {
      queryFiltersMappedObject = {
        playerId: 'playerId',
        firstName: 'detail.FirstName',
        lastName: 'detail.LastName',
        status: 'detail.Status',
      };
    }

    // QueryFilterObject
    var queryFilters = {};

    // Logic to prepare final queryFilterObject
    const skippableKeys = ['limit', 'page'];
    if (['asc', 'desc'].includes(query.status)) {
      skippableKeys.push('status');
    }

    for (const [key, value] of Object.entries(query)) {
      if (skippableKeys.includes(key)) {
        continue;
      } else {
        const mappedKey = queryFiltersMappedObject[key];
        if (likeSearchFields.includes(key)) {
          queryFilters[mappedKey] = {
            $regex: value,
            $options: 'i',
          };
        } else {
          if (typeof mappedKey !== 'undefined') {
            queryFilters[mappedKey] = value;
          }
        }
      }
    }

    const { limit, page, email, ...objectWithoutPageAndLimit } = query;

    let finalQuery: any =
      Object.keys(objectWithoutPageAndLimit).length === 0
        ? []
        : [{ $match: { ...queryFilters } }];

    finalQuery = [
      ...finalQuery,
      {
        $unset: ['games', 'fantasyData'],
      },
      {
        $lookup: {
          from: 'playerfavoriteentities',
          localField: '_id',
          foreignField: 'player',
          as: 'favorite',
        },
      },
      {
        $addFields: {
          isFavorite: {
            $in: [email, '$favorite.email'],
          },
        },
      },
      {
        $unset: 'favorite',
      },
    ];

    if (['asc', 'desc'].includes(query.status)) {
      finalQuery.push({
        $sort: {
          value: !query.status ? -1 : query.status == 'asc' ? 1 : -1,
        },
      });
    }

    try {
      return {
        data: await this.playerModal
          .aggregate(finalQuery)
          .skip(skip)
          .limit(_limit),
        total: await this.playerModal.countDocuments(queryFilters),
      };
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Internal Server Error');
    }
  }

  async listForGuestUser(query: FilterPlayerWithPaginationDto) {
    try {
      // Pagination Related Variables
      const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
      const page = query.page || DEFAULT_PAGINATION_PAGE;
      const skip = page * limit;
      const status = query.status;

      // Fields that are matched using Regex
      const likeSearchFields = ['firstName', 'lastName'];

      // Object containing fields that define how data coming from FrontEnd would map to Mongo-Document
      var queryFiltersMappedObject = null;

      if (query.team !== 'all') {
        queryFiltersMappedObject = {
          playerId: 'playerId',
          firstName: 'detail.FirstName',
          lastName: 'detail.LastName',
          status: 'detail.Status',
          team: 'detail.Position',
        };
      } else {
        queryFiltersMappedObject = {
          playerId: 'playerId',
          firstName: 'detail.FirstName',
          lastName: 'detail.LastName',
          status: 'detail.Status',
        };
      }

      // QueryFilterObject
      const queryFilters = {};

      // Logic to prepare final queryFilterObject
      const skippableKeys = ['limit', 'page'];
      if (['asc', 'desc'].includes(query.status)) {
        skippableKeys.push('status');
      }

      for (const [key, value] of Object.entries(query)) {
        if (skippableKeys.includes(key)) {
          continue;
        } else {
          const mappedKey = queryFiltersMappedObject[key];
          if (likeSearchFields.includes(key)) {
            queryFilters[mappedKey] = {
              $regex: value,
              $options: 'i',
            };
          } else {
            queryFilters[mappedKey] = value;
          }
        }
      }

      let sort = {};
      if (['asc', 'desc'].includes(query.status)) {
        sort = {
          rating: query.status,
        };
      }

      const data = await this.playerModal
        .find({ ...queryFilters }, { games: false, fantasyData: false })
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await this.playerModal.countDocuments(queryFilters);

      return { data, total };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Internal Server Error');
    }
  }

  async listAll(query: FilterPlayerWithPaginationDto) {
    if ([undefined, null, 'undefined'].includes(query.email)) {
      return await this.listForGuestUser(query);
    } else {
      return await this.listAllForAuthenticatedUser(query);
    }
  }

  async getAllPlayersCount() {
    return await this.playerModal.countDocuments();
  }

  async getSinglePlayerDetails(playerId) {
    const data = await this.playerModal.aggregate([
      {
        $match: {
          playerId: playerId,
        },
      },
      {
        $lookup: {
          from: 'nftentities',
          localField: 'playerId',
          foreignField: 'playerId',
          as: 'correspondingNft',
        },
      },
      {
        $match: {
          'correspondingNft.0': {
            $exists: true,
          },
        },
      },
      {
        $unwind: {
          path: '$correspondingNft',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          player: {
            id: '$playerId',
            detail: '$detail',
            rating: '$rating',
            historicalRating: '$historicalRating',
          },
          gameData: {
            fantasyData: '$fantasyData',
            gameData: '$games',
          },
          nft: {
            _id: '$correspondingNft._id',
            meta: '$correspondingNft.meta',
            id: '$correspondingNft.nftId',
            value: '$correspondingNft.value',
          },
        },
      },
    ]);

    let totalGames = data?.[0]?.gameData?.gameData;
    totalGames = totalGames ? totalGames : [];

    var PassingYards = 0;
    var PassingTouchdowns = 0;
    var PassingInterceptions = 0;
    var PassingRating = 0;
    var PassingCompletionPercentage = 0;
    var PassingAttempts = 0;
    var PassingCompletions = 0;
    var PassingYardsPerAttempt = 0;
    var PassingYardsPerCompletion = 0;
    var PassingTouchdowns = 0;
    var PassingInterceptions = 0;
    var PassingRating = 0;
    var PassingLong = 0;
    var PassingSacks = 0;
    var PassingSackYards = 0;
    var RushingAttempts = 0;
    var RushingYards = 0;
    var RushingYardsPerAttempt = 0;
    var RushingTouchdowns = 0;
    var RushingLong = 0;
    var ReceivingTargets = 0;
    var Receptions = 0;
    var ReceivingYards = 0;
    var ReceivingYardsPerReception = 0;
    var ReceivingTouchdowns = 0;
    var ReceivingLong = 0;
    var Fumbles = 0;
    var FumblesLost = 0;
    var PuntReturns = 0;
    var PuntReturnYards = 0;
    var PuntReturnYardsPerAttempt = 0;
    var PuntReturnTouchdowns = 0;
    var PuntReturnLong = 0;
    var KickReturns = 0;
    var KickReturnYards = 0;
    var KickReturnYardsPerAttempt = 0;
    var KickReturnTouchdowns = 0;
    var KickReturnLong = 0;
    var SoloTackles = 0;
    var AssistedTackles = 0;
    var TacklesForLoss = 0;
    var TacklesForLoss = 0;
    var Sacks = 0;
    var SackYards = 0;
    var QuarterbackHits = 0;
    var PassesDefended = 0;
    var FumblesForced = 0;
    var FumblesRecovered = 0;
    var FumbleReturnYards = 0;
    var FumbleReturnTouchdowns = 0;
    var Interceptions = 0;
    var InterceptionReturnYards = 0;
    var InterceptionReturnTouchdowns = 0;
    var BlockedKicks = 0;
    var SpecialTeamsSoloTackles = 0;
    var SpecialTeamsAssistedTackles = 0;
    var MiscSoloTackles = 0;
    var MiscAssistedTackles = 0;
    var Punts = 0;
    var PuntYards = 0;
    var PuntAverage = 0;
    var FieldGoalsAttempted = 0;
    var FieldGoalsMade = 0;
    var FieldGoalsLongestMade = 0;
    var ExtraPointsMade = 0;
    var TwoPointConversionPasses = 0;
    var TwoPointConversionRuns = 0;
    var TwoPointConversionReceptions = 0;
    var FantasyPoints = 0;
    var FantasyPointsPPR = 0;
    var ReceptionPercentage = 0;
    var ReceivingYardsPerTarget = 0;
    var Tackles = 0;
    var OffensiveTouchdowns = 0;
    var DefensiveTouchdowns = 0;
    var SpecialTeamsTouchdowns = 0;
    var Touchdowns = 0;
    var FieldGoalPercentage = 0;
    var FumblesOwnRecoveries = 0;
    var FumblesOutOfBounds = 0;
    var KickReturnFairCatches = 0;
    var PuntReturnFairCatches = 0;
    var PuntTouchbacks = 0;
    var PuntInside20 = 0;
    var PuntNetAverage = 0;
    var ExtraPointsAttempted = 0;
    var BlockedKickReturnTouchdowns = 0;
    var FieldGoalReturnTouchdowns = 0;
    var Safeties = 0;
    var FieldGoalsHadBlocked = 0;
    var PuntsHadBlocked = 0;
    var ExtraPointsHadBlocked = 0;
    var PuntLong = 0;
    var BlockedKickReturnYards = 0;
    var FieldGoalReturnYards = 0;
    var PuntNetYards = 0;
    var SpecialTeamsFumblesForced = 0;
    var SpecialTeamsFumblesRecovered = 0;
    //
    var MiscFumblesForced = 0;
    var MiscFumblesRecovered = 0;
    var ShortName = 0;
    var PlayingSurface = 0;
    var IsGameOver = 0;
    var SafetiesAllowed = 0;
    var Stadium = 0;
    var Temperature = 0;
    var Humidity = 0;
    var WindSpeed = 0;
    var FanDuelSalary = 0;
    var DraftKingsSalary = 0;
    var FantasyDataSalary = 0;
    var OffensiveSnapsPlayed = 0;
    var DefensiveSnapsPlayed = 0;
    var SpecialTeamsSnapsPlayed = 0;
    var OffensiveTeamSnaps = 0;
    var DefensiveTeamSnaps = 0;
    var SpecialTeamsTeamSnaps = 0;
    var VictivSalary = 0;
    var TwoPointConversionReturns = 0;
    var FantasyPointsFanDuel = 0;
    var FieldGoalsMade0to19 = 0;
    var FieldGoalsMade20to29 = 0;
    var FieldGoalsMade30to39 = 0;
    var FieldGoalsMade40to49 = 0;
    var FieldGoalsMade50Plus = 0;
    var FantasyPointsDraftKings = 0;
    var YahooSalary = 0;
    var FantasyPointsYahoo = 0;
    var InjuryStatus = 0;
    var InjuryBodyPart = 0;
    var InjuryStartDate = 0;
    var InjuryNotes = 0;
    var FanDuelPosition = 0;
    var DraftKingsPosition = 0;
    var YahooPosition = 0;
    var OpponentRank = 0;
    var OpponentPositionRank = 0;
    var InjuryPractice = 0;
    var InjuryPracticeDescription = 0;
    var DeclaredInactive = 0;
    var FantasyDraftSalary = 0;
    var FantasyDraftPosition = 0;
    var TeamID = 0;
    var OpponentID = 0;
    var Day = 0;
    var DateTime = 0;
    var GlobalGameID = 0;
    var GlobalTeamID = 0;
    var GlobalOpponentID = 0;
    var ScoreID = 0;
    var FantasyPointsFantasyDraft = 0;
    var OffensiveFumbleRecoveryTouchdowns = 0;
    var SnapCountsConfirmed = 0;

    totalGames.forEach((item) => {
      PassingYards += item.PassingYards;
      PassingTouchdowns += item.PassingTouchdowns;
      PassingInterceptions += item.PassingInterceptions;
      PassingRating += item.PassingRating;
      PassingCompletionPercentage += item.PassingCompletionPercentage;
      PassingAttempts += item.PassingAttempts;
      PassingCompletions += item.PassingCompletions;
      PassingYardsPerAttempt += item.PassingYardsPerAttempt;
      PassingYardsPerCompletion += item.PassingYardsPerCompletion;
      PassingTouchdowns += item.PassingTouchdowns;
      PassingInterceptions += item.PassingInterceptions;
      PassingRating += item.PassingRating;
      PassingLong += item.PassingLong;
      PassingSacks += item.PassingSacks;

      PassingSackYards += item.PassingSackYards;
      RushingAttempts += item.RushingAttempts;
      RushingYards += item.RushingYards;
      RushingYardsPerAttempt += item.RushingYardsPerAttempt;
      RushingTouchdowns += item.RushingTouchdowns;
      RushingLong += item.RushingLong;
      ReceivingTargets += item.ReceivingTargets;
      Receptions += item.Receptions;
      ReceivingYards += item.ReceivingYards;
      ReceivingYardsPerReception += item.ReceivingYardsPerReception;
      ReceivingTouchdowns += item.ReceivingTouchdowns;
      ReceivingLong += item.ReceivingLong;
      Fumbles += item.Fumbles;
      FumblesLost += item.FumblesLost;
      PuntReturns += item.PuntReturns;
      PuntReturnYards += item.PuntReturnYards;
      PuntReturnYardsPerAttempt += item.PuntReturnYardsPerAttempt;
      PuntReturnTouchdowns += item.PuntReturnTouchdowns;
      PuntReturnLong += item.PuntReturnLong;
      KickReturns += item.KickReturns;
      KickReturnYards += item.KickReturnYards;
      KickReturnYardsPerAttempt += item.KickReturnYardsPerAttempt;
      KickReturnTouchdowns += item.KickReturnTouchdowns;
      KickReturnLong += item.KickReturnLong;
      SoloTackles += item.SoloTackles;
      AssistedTackles += item.AssistedTackles;
      TacklesForLoss += item.TacklesForLoss;
      TacklesForLoss += item.TacklesForLoss;
      Sacks += item.Sacks;
      SackYards += item.SackYards;
      QuarterbackHits += item.QuarterbackHits;
      PassesDefended += item.PassesDefended;
      FumblesForced += item.FumblesForced;
      FumblesRecovered += item.FumblesRecovered;
      FumbleReturnYards += item.FumbleReturnYards;
      FumbleReturnTouchdowns += item.FumbleReturnTouchdowns;
      Interceptions += item.Interceptions;
      InterceptionReturnYards += item.InterceptionReturnYards;
      InterceptionReturnTouchdowns += item.InterceptionReturnTouchdowns;
      BlockedKicks += item.BlockedKicks;
      SpecialTeamsSoloTackles += item.SpecialTeamsSoloTackles;
      SpecialTeamsAssistedTackles += item.SpecialTeamsAssistedTackles;
      MiscSoloTackles += item.MiscSoloTackles;
      MiscAssistedTackles += item.MiscAssistedTackles;
      Punts += item.Punts;
      PuntYards += item.PuntYards;
      PuntAverage += item.PuntAverage;
      FieldGoalsAttempted += item.FieldGoalsAttempted;
      FieldGoalsMade += item.FieldGoalsMade;
      FieldGoalsLongestMade += item.FieldGoalsLongestMade;
      ExtraPointsMade += item.ExtraPointsMade;
      TwoPointConversionPasses += item.TwoPointConversionPasses;
      TwoPointConversionRuns += item.TwoPointConversionRuns;
      TwoPointConversionReceptions += item.TwoPointConversionReceptions;
      FantasyPoints += item.FantasyPoints;
      FantasyPointsPPR += item.FantasyPointsPPR;
      ReceptionPercentage += item.ReceptionPercentage;
      ReceivingYardsPerTarget += item.ReceivingYardsPerTarget;
      Tackles += item.Tackles;
      OffensiveTouchdowns += item.OffensiveTouchdowns;
      DefensiveTouchdowns += item.DefensiveTouchdowns;
      SpecialTeamsTouchdowns += item.SpecialTeamsTouchdowns;
      Touchdowns += item.Touchdowns;
      FieldGoalPercentage += item.FieldGoalPercentage;
      FumblesOwnRecoveries += item.FumblesOwnRecoveries;
      FumblesOutOfBounds += item.FumblesOutOfBounds;
      KickReturnFairCatches += item.KickReturnFairCatches;
      PuntReturnFairCatches += item.PuntReturnFairCatches;
      PuntTouchbacks += item.PuntTouchbacks;
      PuntInside20 += item.PuntInside20;
      PuntNetAverage += item.PuntNetAverage;
      ExtraPointsAttempted += item.ExtraPointsAttempted;
      BlockedKickReturnTouchdowns += item.BlockedKickReturnTouchdowns;
      FieldGoalReturnTouchdowns += item.FieldGoalReturnTouchdowns;
      Safeties += item.Safeties;
      FieldGoalsHadBlocked += item.FieldGoalsHadBlocked;
      PuntsHadBlocked += item.PuntsHadBlocked;
      ExtraPointsHadBlocked += item.ExtraPointsHadBlocked;
      PuntLong += item.PuntLong;
      BlockedKickReturnYards += item.BlockedKickReturnYards;
      FieldGoalReturnYards += item.FieldGoalReturnYards;
      PuntNetYards += item.PuntNetYards;
      SpecialTeamsFumblesForced += item.SpecialTeamsFumblesForced;
      SpecialTeamsFumblesRecovered += item.SpecialTeamsFumblesRecovered;
      //
      MiscFumblesForced += item.MiscFumblesForced;
      MiscFumblesRecovered += item.MiscFumblesRecovered;
      ShortName = item.ShortName;
      PlayingSurface = item.PlayingSurface;
      IsGameOver += item.IsGameOver;
      SafetiesAllowed += item.SafetiesAllowed;
      Stadium = item.Stadium;
      Temperature += item.Temperature;
      Humidity += item.Humidity;
      WindSpeed += item.WindSpeed;
      FanDuelSalary += item.FanDuelSalary;
      DraftKingsSalary += item.DraftKingsSalary;
      FantasyDataSalary += item.FantasyDataSalary;
      OffensiveSnapsPlayed += item.OffensiveSnapsPlayed;
      DefensiveSnapsPlayed += item.DefensiveSnapsPlayed;
      SpecialTeamsSnapsPlayed += item.SpecialTeamsSnapsPlayed;
      OffensiveTeamSnaps += item.OffensiveTeamSnaps;
      DefensiveTeamSnaps += item.DefensiveTeamSnaps;
      SpecialTeamsTeamSnaps += item.SpecialTeamsTeamSnaps;
      VictivSalary += item.VictivSalary;
      TwoPointConversionReturns += item.TwoPointConversionReturns;
      FantasyPointsFanDuel += item.FantasyPointsFanDuel;
      FieldGoalsMade0to19 += item.FieldGoalsMade0to19;
      FieldGoalsMade20to29 += item.FieldGoalsMade20to29;
      FieldGoalsMade30to39 += item.FieldGoalsMade30to39;
      FieldGoalsMade40to49 += item.FieldGoalsMade40to49;
      FieldGoalsMade50Plus += item.FieldGoalsMade50Plus;
      FantasyPointsDraftKings += item.FantasyPointsDraftKings;
      YahooSalary += item.YahooSalary;
      FantasyPointsYahoo += item.FantasyPointsYahoo;
      InjuryStatus += item.InjuryStatus;
      InjuryBodyPart += item.InjuryBodyPart;
      InjuryStartDate += item.InjuryStartDate;
      InjuryNotes += item.InjuryNotes;
      FanDuelPosition = item.FanDuelPosition;
      DraftKingsPosition = item.DraftKingsPosition;
      YahooPosition = item.YahooPosition;
      OpponentRank += item.OpponentRank;
      OpponentPositionRank += item.OpponentPositionRank;
      InjuryPractice += item.InjuryPractice;
      InjuryPracticeDescription += item.InjuryPracticeDescription;
      DeclaredInactive += item.DeclaredInactive;
      FantasyDraftSalary += item.FantasyDraftSalary;
      FantasyDraftPosition += item.FantasyDraftPosition;
      TeamID += item.TeamID;
      OpponentID += item.OpponentID;
      Day = item.Day;
      DateTime = item.DateTime;
      GlobalGameID += item.GlobalGameID;
      GlobalTeamID += item.GlobalTeamID;
      GlobalOpponentID += item.GlobalOpponentID;
      ScoreID += item.ScoreID;
      FantasyPointsFantasyDraft += item.FantasyPointsFantasyDraft;
      OffensiveFumbleRecoveryTouchdowns +=
        item.OffensiveFumbleRecoveryTouchdowns;
      SnapCountsConfirmed += item.SnapCountsConfirmed;
    });

    let payload = {
      player: data?.[0]?.player,
      lastGameStats: {
        PassingYards: totalGames[0]?.PassingYards,
        PassingTouchdowns: totalGames[0]?.PassingTouchdowns,
        PassingInterceptions: totalGames[0]?.PassingInterceptions,
        PassingRating: totalGames[0]?.PassingRating,
        PassingCompletionPercentage:
          +totalGames[0]?.PassingCompletionPercentage?.toFixed(2),

        PassingAttempts: totalGames[0]?.PassingAttempts,
        PassingCompletions: totalGames[0]?.PassingCompletions,
        PassingYardsPerAttempt: totalGames[0]?.PassingYardsPerAttempt,
        PassingYardsPerCompletion: totalGames[0]?.PassingYardsPerCompletion,
        PassingLong: totalGames[0]?.PassingLong,
        PassingSacks: totalGames[0]?.PassingSacks,
        PassingSackYards: totalGames[0]?.PassingSackYards,
        RushingAttempts: totalGames[0]?.RushingAttempts,
        RushingYards: totalGames[0]?.RushingYards,
        RushingYardsPerAttempt: totalGames[0]?.RushingYardsPerAttempt,
        RushingTouchdowns: totalGames[0]?.RushingTouchdowns,
        RushingLong: totalGames[0]?.RushingLong,
        ReceivingTargets: totalGames[0]?.ReceivingTargets,
        Receptions: totalGames[0]?.Receptions,
        ReceivingYards: totalGames[0]?.ReceivingYards,
        ReceivingYardsPerReception: totalGames[0]?.ReceivingYardsPerReception,
        ReceivingTouchdowns: totalGames[0]?.ReceivingTouchdowns,
        ReceivingLong: totalGames[0]?.ReceivingLong,
        Fumbles: totalGames[0]?.Fumbles,
        FumblesLost: totalGames[0]?.FumblesLost,
        PuntReturns: totalGames[0]?.PuntReturns,
        PuntReturnYards: totalGames[0]?.PuntReturnYards,
        PuntReturnYardsPerAttempt: totalGames[0]?.PuntReturnYardsPerAttempt,
        PuntReturnTouchdowns: totalGames[0]?.PuntReturnTouchdowns,
        PuntReturnLong: totalGames[0]?.PuntReturnLong,
        KickReturns: totalGames[0]?.KickReturns,
        KickReturnYards: totalGames[0]?.KickReturnYards,
        KickReturnYardsPerAttempt: totalGames[0]?.KickReturnYardsPerAttempt,
        KickReturnTouchdowns: totalGames[0]?.KickReturnTouchdowns,
        KickReturnLong: totalGames[0]?.KickReturnLong,
        SoloTackles: totalGames[0]?.SoloTackles,
        AssistedTackles: totalGames[0]?.AssistedTackles,
        TacklesForLoss: totalGames[0]?.TacklesForLoss,
        Sacks: totalGames[0]?.Sacks,
        SackYards: totalGames[0]?.SackYards,
        QuarterbackHits: totalGames[0]?.QuarterbackHits,
        PassesDefended: totalGames[0]?.PassesDefended,
        FumblesForced: totalGames[0]?.FumblesForced,
        FumblesRecovered: totalGames[0]?.FumblesRecovered,
        FumbleReturnYards: totalGames[0]?.FumbleReturnYards,
        FumbleReturnTouchdowns: totalGames[0]?.FumbleReturnTouchdowns,
        Interceptions: totalGames[0]?.Interceptions,
        InterceptionReturnYards: totalGames[0]?.InterceptionReturnYards,
        InterceptionReturnTouchdowns:
          totalGames[0]?.InterceptionReturnTouchdowns,
        BlockedKicks: totalGames[0]?.BlockedKicks,
        SpecialTeamsSoloTackles: totalGames[0]?.SpecialTeamsSoloTackles,
        SpecialTeamsAssistedTackles: totalGames[0]?.SpecialTeamsAssistedTackles,
        MiscSoloTackles: totalGames[0]?.MiscSoloTackles,
        MiscAssistedTackles: totalGames[0]?.MiscAssistedTackles,
        Punts: totalGames[0]?.Punts,
        PuntYards: totalGames[0]?.PuntYards,
        PuntAverage: totalGames[0]?.PuntAverage,
        FieldGoalsAttempted: totalGames[0]?.FieldGoalsAttempted,
        FieldGoalsMade: totalGames[0]?.FieldGoalsMade,
        FieldGoalsLongestMade: totalGames[0]?.FieldGoalsLongestMade,
        ExtraPointsMade: totalGames[0]?.ExtraPointsMade,
        TwoPointConversionPasses: totalGames[0]?.TwoPointConversionPasses,
        TwoPointConversionRuns: totalGames[0]?.TwoPointConversionRuns,
        TwoPointConversionReceptions:
          totalGames[0]?.TwoPointConversionReceptions,
        FantasyPoints: totalGames[0]?.FantasyPoints,
        FantasyPointsPPR: totalGames[0]?.FantasyPointsPPR,
        ReceptionPercentage: totalGames[0]?.ReceptionPercentage,
        ReceivingYardsPerTarget: totalGames[0]?.ReceivingYardsPerTarget,
        Tackles: totalGames[0]?.Tackles,
        OffensiveTouchdowns: totalGames[0]?.OffensiveTouchdowns,
        DefensiveTouchdowns: totalGames[0]?.DefensiveTouchdowns,
        SpecialTeamsTouchdowns: totalGames[0]?.SpecialTeamsTouchdowns,
        Touchdowns: totalGames[0]?.Touchdowns,
        FieldGoalPercentage: totalGames[0]?.FieldGoalPercentage,
        FumblesOwnRecoveries: totalGames[0]?.FumblesOwnRecoveries,
        FumblesOutOfBounds: totalGames[0]?.FumblesOutOfBounds,
        KickReturnFairCatches: totalGames[0]?.KickReturnFairCatches,
        PuntReturnFairCatches: totalGames[0]?.PuntReturnFairCatches,
        PuntTouchbacks: totalGames[0]?.PuntTouchbacks,
        PuntInside20: totalGames[0]?.PuntInside20,
        PuntNetAverage: totalGames[0]?.PuntNetAverage,
        ExtraPointsAttempted: totalGames[0]?.ExtraPointsAttempted,
        BlockedKickReturnTouchdowns: totalGames[0]?.BlockedKickReturnTouchdowns,
        FieldGoalReturnTouchdowns: totalGames[0]?.FieldGoalReturnTouchdowns,
        Safeties: totalGames[0]?.Safeties,
        FieldGoalsHadBlocked: totalGames[0]?.FieldGoalsHadBlocked,
        PuntsHadBlocked: totalGames[0]?.PuntsHadBlocked,
        ExtraPointsHadBlocked: totalGames[0]?.ExtraPointsHadBlocked,
        PuntLong: totalGames[0]?.PuntLong,
        BlockedKickReturnYards: totalGames[0]?.BlockedKickReturnYards,
        FieldGoalReturnYards: totalGames[0]?.FieldGoalReturnYards,
        PuntNetYards: totalGames[0]?.PuntNetYards,
        SpecialTeamsFumblesForced: totalGames[0]?.SpecialTeamsFumblesForced,
        SpecialTeamsFumblesRecovered:
          totalGames[0]?.SpecialTeamsFumblesRecovered,

        //
        MiscFumblesForced: totalGames[0]?.MiscFumblesForced,
        MiscFumblesRecovered: totalGames[0]?.MiscFumblesRecovered,
        ShortName: totalGames[0]?.ShortName,
        PlayingSurface: totalGames[0]?.PlayingSurface,
        IsGameOver: totalGames[0]?.IsGameOver,
        SafetiesAllowed: totalGames[0]?.SafetiesAllowed,
        Stadium: totalGames[0]?.Stadium,
        Temperature: totalGames[0]?.Temperature,
        Humidity: totalGames[0]?.Humidity,
        WindSpeed: totalGames[0]?.WindSpeed,
        FanDuelSalary: totalGames[0]?.FanDuelSalary,
        DraftKingsSalary: totalGames[0]?.DraftKingsSalary,
        FantasyDataSalary: totalGames[0]?.FantasyDataSalary,
        OffensiveSnapsPlayed: totalGames[0]?.OffensiveSnapsPlayed,
        DefensiveSnapsPlayed: totalGames[0]?.DefensiveSnapsPlayed,
        SpecialTeamsSnapsPlayed: totalGames[0]?.SpecialTeamsSnapsPlayed,
        OffensiveTeamSnaps: totalGames[0]?.OffensiveTeamSnaps,
        DefensiveTeamSnaps: totalGames[0]?.DefensiveTeamSnaps,
        SpecialTeamsTeamSnaps: totalGames[0]?.SpecialTeamsTeamSnaps,
        VictivSalary: totalGames[0]?.VictivSalary,
        TwoPointConversionReturns: totalGames[0]?.TwoPointConversionReturns,
        FantasyPointsFanDuel: totalGames[0]?.FantasyPointsFanDuel,
        FieldGoalsMade0to19: totalGames[0]?.FieldGoalsMade0to19,
        FieldGoalsMade20to29: totalGames[0]?.FieldGoalsMade20to29,
        FieldGoalsMade30to39: totalGames[0]?.FieldGoalsMade30to39,
        FieldGoalsMade40to49: totalGames[0]?.FieldGoalsMade40to49,
        FieldGoalsMade50Plus: totalGames[0]?.FieldGoalsMade50Plus,
        FantasyPointsDraftKings: totalGames[0]?.FantasyPointsDraftKings,
        YahooSalary: totalGames[0]?.YahooSalary,
        FantasyPointsYahoo: totalGames[0]?.FantasyPointsYahoo,
        InjuryStatus: totalGames[0]?.InjuryStatus,
        InjuryBodyPart: totalGames[0]?.InjuryBodyPart,
        InjuryStartDate: totalGames[0]?.InjuryStartDate,
        InjuryNotes: totalGames[0]?.InjuryNotes,
        FanDuelPosition: totalGames[0]?.FanDuelPosition,
        DraftKingsPosition: totalGames[0]?.DraftKingsPosition,
        YahooPosition: totalGames[0]?.YahooPosition,
        OpponentRank: totalGames[0]?.OpponentRank,
        OpponentPositionRank: totalGames[0]?.OpponentPositionRank,
        InjuryPractice: totalGames[0]?.InjuryPractice,
        InjuryPracticeDescription: totalGames[0]?.InjuryPracticeDescription,
        DeclaredInactive: totalGames[0]?.DeclaredInactive,
        FantasyDraftSalary: totalGames[0]?.FantasyDraftSalary,
        FantasyDraftPosition: totalGames[0]?.FantasyDraftPosition,
        TeamID: totalGames[0]?.TeamID,
        OpponentID: totalGames[0]?.OpponentID,
        Day: totalGames[0]?.Day,
        DateTime: totalGames[0]?.DateTime,
        GlobalGameID: totalGames[0]?.GlobalGameID,
        GlobalTeamID: totalGames[0]?.GlobalTeamID,
        GlobalOpponentID: totalGames[0]?.GlobalOpponentID,
        ScoreID: totalGames[0]?.ScoreID,
        FantasyPointsFantasyDraft: totalGames[0]?.FantasyPointsFantasyDraft,
        OffensiveFumbleRecoveryTouchdowns:
          totalGames[0]?.OffensiveFumbleRecoveryTouchdowns,
        SnapCountsConfirmed: totalGames[0]?.SnapCountsConfirmed,
      },
      careerStats: {
        PassingYards,
        PassingTouchdowns,
        PassingInterceptions,
        PassingRating: +PassingRating.toFixed(2),
        PassingCompletionPercentage: +(
          PassingCompletionPercentage / totalGames.length
        ).toFixed(2),

        PassingAttempts,
        PassingCompletions,
        PassingYardsPerAttempt,
        PassingYardsPerCompletion,
        PassingLong,
        PassingSacks,
        PassingSackYards,
        RushingAttempts,
        RushingYards,
        RushingYardsPerAttempt,
        RushingTouchdowns,
        RushingLong,
        ReceivingTargets,
        Receptions,
        ReceivingYards,
        ReceivingYardsPerReception,
        ReceivingTouchdowns,
        ReceivingLong,
        Fumbles,
        FumblesLost,
        PuntReturns,
        PuntReturnYards,
        PuntReturnYardsPerAttempt,
        PuntReturnTouchdowns,
        PuntReturnLong,
        KickReturns,
        KickReturnYards,
        KickReturnYardsPerAttempt,
        KickReturnTouchdowns,
        KickReturnLong,
        SoloTackles,
        AssistedTackles,
        TacklesForLoss,
        Sacks,
        SackYards,
        QuarterbackHits,
        PassesDefended,
        FumblesForced,
        FumblesRecovered,
        FumbleReturnYards,
        FumbleReturnTouchdowns,
        Interceptions,
        InterceptionReturnYards,
        InterceptionReturnTouchdowns,
        BlockedKicks,
        SpecialTeamsSoloTackles,
        SpecialTeamsAssistedTackles,
        MiscSoloTackles,
        MiscAssistedTackles,
        Punts,
        PuntYards,
        PuntAverage,
        FieldGoalsAttempted,
        FieldGoalsMade,
        FieldGoalsLongestMade,
        ExtraPointsMade,
        TwoPointConversionPasses,
        TwoPointConversionRuns,
        TwoPointConversionReceptions,
        FantasyPoints,
        FantasyPointsPPR,
        ReceptionPercentage,
        ReceivingYardsPerTarget,
        Tackles,
        OffensiveTouchdowns,
        DefensiveTouchdowns,
        SpecialTeamsTouchdowns,
        Touchdowns,
        FieldGoalPercentage,
        FumblesOwnRecoveries,
        FumblesOutOfBounds,
        KickReturnFairCatches,
        PuntReturnFairCatches,
        PuntTouchbacks,
        PuntInside20,
        PuntNetAverage,
        ExtraPointsAttempted,
        BlockedKickReturnTouchdowns,
        FieldGoalReturnTouchdowns,
        Safeties,
        FieldGoalsHadBlocked,
        PuntsHadBlocked,
        ExtraPointsHadBlocked,
        PuntLong,
        BlockedKickReturnYards,
        FieldGoalReturnYards,
        PuntNetYards,
        SpecialTeamsFumblesForced,
        SpecialTeamsFumblesRecovered,
        //
        MiscFumblesForced,
        MiscFumblesRecovered,
        ShortName,
        PlayingSurface,
        IsGameOver,
        SafetiesAllowed,
        Stadium,
        Temperature,
        Humidity,
        WindSpeed,
        FanDuelSalary,
        DraftKingsSalary,
        FantasyDataSalary,
        OffensiveSnapsPlayed,
        DefensiveSnapsPlayed,
        SpecialTeamsSnapsPlayed,
        OffensiveTeamSnaps,
        DefensiveTeamSnaps,
        SpecialTeamsTeamSnaps,
        VictivSalary,
        TwoPointConversionReturns,
        FantasyPointsFanDuel,
        FieldGoalsMade0to19,
        FieldGoalsMade20to29,
        FieldGoalsMade30to39,
        FieldGoalsMade40to49,
        FieldGoalsMade50Plus,
        FantasyPointsDraftKings,
        YahooSalary,
        FantasyPointsYahoo,
        InjuryStatus,
        InjuryBodyPart,
        InjuryStartDate,
        InjuryNotes,
        FanDuelPosition,
        DraftKingsPosition,
        YahooPosition,
        OpponentRank,
        OpponentPositionRank,
        InjuryPractice,
        InjuryPracticeDescription,
        DeclaredInactive,
        FantasyDraftSalary,
        FantasyDraftPosition,
        TeamID,
        OpponentID,
        Day,
        DateTime,
        GlobalGameID,
        GlobalTeamID,
        GlobalOpponentID,
        ScoreID,
        FantasyPointsFantasyDraft,
        OffensiveFumbleRecoveryTouchdowns,
        SnapCountsConfirmed,
      },
      fantasyData: data?.[0]?.gameData?.fantasyData,
      nft: data?.[0]?.nft,
      circulatedNfts: 0,
      totalCirculatedNftsValue: 0,
      totalGames: [],
    };

    let playerNft = await this.nftModel.findOne({
      playerId: data?.[0]?.player.id,
    });

    const circulatedNfts =
      (
        await this.userAndMintedNftModel.aggregate([
          {
            $match: {
              nftId: new ObjectId(playerNft._id),
            },
          },
          {
            $group: {
              _id: '$nftId',
              circulatedNfts: {
                $sum: '$count',
              },
            },
          },
          {
            $project: {
              _id: 0,
              circulatedNfts: 1,
            },
          },
        ])
      )?.[0]?.circulatedNfts || 0;

    payload.circulatedNfts = circulatedNfts;
    payload.totalCirculatedNftsValue = data?.[0]?.nft.value * circulatedNfts;
    (payload.lastGameStats = totalGames[0]), (payload.totalGames = totalGames);

    return {
      data: payload,
    };
  }

  // async test() {
  //   let mintedNfts = await this.userAndMintedNftModel.distinct('nftId');

  //   for (let index = 0; index < mintedNfts.length; index++) {
  //     let element = mintedNfts[index];

  //     var nftId = new ObjectId(element.nftId);

  //     console.log(nftId);

  //     let nft = await this.nftModel.findById({ nftId });

  //     let player = await this.playerModal.findOne({ playerId: nft.playerId });

  //     player.isMinted = true;
  //     await player.save();

  //     console.log(index);
  //   }
  // }

  async playersByRating(query) {
    try {
      // Pagination Related Variables
      const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
      const page = query.page || DEFAULT_PAGINATION_PAGE;
      const skip = page * limit;

      const data =
        query.team !== 'all'
          ? await this.playerModal
              .find(
                {
                  'detail.Position': query.team,
                  isMinted: true,
                },
                { games: false, fantasyData: false },
              )
              .sort({ rating: -1 })
              .skip(skip)
              .limit(limit)
          : await this.playerModal
              .find({ isMinted: true }, { games: false, fantasyData: false })
              .sort({ rating: -1 })
              .skip(skip)
              .limit(limit);

      // const total = await this.playerModal.countDocuments();

      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        element.nft = await this.nftModel.findOne({
          playerId: element.playerId,
        });
      }

      return { data, total: data.length };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Internal Server Error');
    }
  }
}
