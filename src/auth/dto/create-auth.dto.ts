import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAuthDto {

    @IsString({ message: "Email should be in proper format" })
    @IsNotEmpty({ message: "Email is required" })
    @ApiProperty({ required: true })
    email: string

    @IsNumber()
    @IsNotEmpty({ message: "OTP Token is required" })
    @ApiProperty({ required: true })
    token: number

};

// export class VerifyAuthDto {
//     @IsString({})
// }
