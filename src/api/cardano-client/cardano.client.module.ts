import { Module } from "@nestjs/common";
import { CardanoClientController } from "./cardano.client.controller";
import { CardanoClient } from "./cardano.client.service";

@Module({
    controllers:[CardanoClientController],
    providers:[CardanoClient],
    exports:[CardanoClient]
})

export class CardanoModule{}