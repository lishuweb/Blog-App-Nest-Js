import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class BlockUserDto {
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Blocked status',
    })
    isActive: boolean
}