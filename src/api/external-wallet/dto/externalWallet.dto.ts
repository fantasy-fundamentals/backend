import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { EXTERNAL_WALLETS_TYPE } from 'src/utils/misc/enum';

export interface ExternalWalletInterface {
  type: EXTERNAL_WALLETS_TYPE;
  address: string;
  coinSymbol: string;
}

export class ExternalWalletDto {
  @ApiProperty()
  @ValidateNested({ each: true })
  wallets: [ExternalWalletInterface];
}
