import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';
import { PlayerStatus } from './player-stauts.enum';
export class FilterPlayerWithPaginationDto extends PaginationDto {
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value))
  @IsOptional()
  playerId?: number;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsEnum(PlayerStatus)
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  team?: string;
}
