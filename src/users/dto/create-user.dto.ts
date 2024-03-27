import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlphanumeric, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { Role } from "@prisma/client";

export class CreateUserDto {
    @IsString({ message: "Name should be string" })
    @IsNotEmpty({ message: "Name is required" })
    @ApiProperty({ required: true })
    name: string;

    @IsString({ message: "Email should be in proper format" })
    @IsNotEmpty({ message: "Email is required" })
    @ApiProperty({ required: true })
    email: string

    @IsAlphanumeric()
    @IsNotEmpty({ message: "Password is required" })
    @ApiProperty({ required: true })
    password: string

    @IsString({ message: "Image should be in proper format" })
    @IsNotEmpty({ message: "Image is required" })
    @ApiProperty({ required: true })
    image: string  

    @IsString()
    @IsOptional()
    @ApiProperty({ description:"Role" })
    roles?: Role
    
    @IsBoolean({ message: "Email Verfication" })
    // @IsNotEmpty({ message: "Email Verfication is required" })
    @ApiProperty({ required: false })
    isEmailVerified: boolean

    @IsBoolean({ message: "User Active" })
    // @IsNotEmpty({ message: "User Active is required" })
    @ApiProperty({ required: false })
    isActive: boolean

    @IsBoolean({ message: "User Archive" })
    // @IsNotEmpty({ message: "User Archive is required" })
    @ApiProperty({ required: false })
    isArchive: boolean

    @IsNumber()
    @IsOptional()
    // @IsNotEmpty({ message: " is required" })
    @ApiProperty({ required: false })
    createdBy?: number

    @IsNumber()
    @IsOptional()
    // @IsNotEmpty({ message: " is required" })
    @ApiProperty({ required: false })
    updatedBy?: number

    @IsString()
    @IsOptional()
    // @IsNotEmpty({ message: " is required" })
    @ApiProperty({ description:"Role" })
    currentRole?: Role
};
