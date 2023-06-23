import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';

export class FilterScoreWithPaginationDto extends PaginationDto {
  @IsBoolean()
  @Transform(({ obj, key }) => obj[key] === 'true')
  upcoming: boolean;
}
