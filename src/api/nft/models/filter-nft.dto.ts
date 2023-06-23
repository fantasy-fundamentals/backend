import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsMongoId,
  IsArray,
} from 'class-validator';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';
import { PlayerStatus } from 'src/api/players/models/player-stauts.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FilterNftWithPaginationDto extends PaginationDto {
  @ApiProperty({ name: 'name', type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ name: 'minted', type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ obj, key }) => obj[key] === 'true')
  minted?: boolean;

  @ApiProperty({ name: 'email', type: String, required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ name: 'status', enum: PlayerStatus, required: false })
  @IsString()
  @IsEnum(PlayerStatus)
  @IsOptional()
  status?: string;

  @ApiProperty({ name: 'team', required: false })
  @IsString()
  @IsOptional()
  team?: string;
}

export class FilterNftForAdminWithPaginationDto extends PaginationDto {
  @ApiProperty({ name: 'name', type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string;
}

export class NftMintDto {
  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @ApiProperty({ name: 'videoUrl', type: String, isArray: true })
  @IsArray()
  videoUrl: string[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class NftTransferDto {
  @IsString()
  @IsNotEmpty()
  nftId: string;

  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
