import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsString } from "class-validator";

export class WithdrawDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    withdrawTo: string

    @ApiProperty()
    @IsNumberString()
    @IsNotEmpty()
    amount:string
}