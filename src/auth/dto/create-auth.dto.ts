import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber, IsAlphanumeric } from 'class-validator';

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

export class LoginAuthDto {
    @IsString({ message: "Email should be in proper format" })
    @IsNotEmpty({ message: "Email is required" })
    @ApiProperty({ required: true })
    email: string

    @IsAlphanumeric()
    @IsNotEmpty({ message: "Password is required" })
    @ApiProperty({ required: true })
    password: string
}

export class ForgotPasswordTokenDto {
    @IsString({ message: "Email should be in proper format" })
    @IsNotEmpty({ message: "Email is required" })
    @ApiProperty({ required: true })
    email: string
}

export class ForgotPasswordDto {
    @IsString({ message: "Email should be in proper format" })
    @IsNotEmpty({ message: "Email is required" })
    @ApiProperty({ required: true })
    email: string

    @IsAlphanumeric()
    @IsNotEmpty({ message: "Password is required" })
    @ApiProperty({ required: true })
    password: string

    @IsNumber()
    @IsNotEmpty({ message: "OTP Token is required" })
    @ApiProperty({ required: true })
    token: number
}

export class ChangePasswordTokenDto {
    @IsString({ message: "Email should be in proper format" })
    @IsNotEmpty({ message: "Email is required" })
    @ApiProperty({ required: true })
    email: string
}

export class ChangePasswordDto {
    @IsString({ message: "Email should be in proper format" })
    @IsNotEmpty({ message: "Email is required" })
    @ApiProperty({ required: true })
    email: string

    @IsAlphanumeric()
    @IsNotEmpty({ message: "Password is required" })
    @ApiProperty({ required: true })
    oldPassword: string

    @IsAlphanumeric()
    @IsNotEmpty({ message: "Password is required" })
    @ApiProperty({ required: true })
    newPassword: string

    @IsNumber()
    @IsNotEmpty({ message: "OTP Token is required" })
    @ApiProperty({ required: true })
    token: number
}