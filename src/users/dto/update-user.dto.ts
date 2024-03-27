import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class BlockUserDto {
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Blocked status',
    })
    isActive: boolean

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
}