import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FeeManagementDto {
  @ApiProperty()
  @IsNotEmpty({ always: true })
  @IsNumber()
  fixedFee: number;

  @ApiProperty()
  @IsNotEmpty({ always: true })
  @IsNumber()
  percentageFee: number;
}
