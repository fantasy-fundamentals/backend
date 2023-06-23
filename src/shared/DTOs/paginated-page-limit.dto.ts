import { IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const DEFAULT_PAGINATION_PAGE = 0
export const DEFAULT_PAGINATION_LIMIT = 10

const paginationDefaultPageTransformer = (obj): number => {
  const { value } = obj
  return +value >= 0 ? Number.parseInt(value) : DEFAULT_PAGINATION_PAGE
}

const paginationDefaultLimitTransformer = (obj): number => {
  const { value } = obj
  return +value > 0 ? Number.parseInt(value) : DEFAULT_PAGINATION_LIMIT
}

export class PaginationDto {
  @ApiProperty({ type: Number, required: false, name: 'page' })
  @IsOptional()
  @Transform(paginationDefaultPageTransformer)
  page?: number;

  @ApiProperty({ type: Number, required: false, name: 'limit' })
  @IsOptional()
  @Transform(paginationDefaultLimitTransformer)
  limit?: number
}