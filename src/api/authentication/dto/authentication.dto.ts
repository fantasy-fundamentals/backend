import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthenticationDto {
    @ApiProperty()
    @IsNotEmpty({ always: true })
    @IsString({ always: true })
    @IsEmail({ always: true })
    email: string;

    @ApiProperty()
    @IsNotEmpty({ always: true })
    @IsString({ always: true })
    @MinLength(5)
    password: string;
}