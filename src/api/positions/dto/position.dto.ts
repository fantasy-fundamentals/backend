import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class PositionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  winStages: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  adminFeePercentage: number;

  @ApiProperty()
  @IsArray()
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  winPercentages: number[];

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  losersDeductionPercentage: number;
}
