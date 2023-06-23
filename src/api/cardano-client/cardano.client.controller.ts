import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CardanoClient } from "./cardano.client.service";
import { WithdrawDto } from "./dto/withdraw.dto";

@Controller("cardano-client")
@ApiTags("Cardano Client Withdraw Apis")
export class CardanoClientController{
    constructor(
        private readonly cardanoService: CardanoClient
    ){}

    @Get("/withdrawable-amount")
    async getWithdrawableAmount(){
        return await this.cardanoService.withdrawableBalance();
    }

    @Post("withdraw")
    async withdraw(@Body() body:WithdrawDto){
        return await this.cardanoService.withDraw(body.withdrawTo, body.amount)
    }
}
