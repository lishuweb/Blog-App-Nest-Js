import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ required: true })
}
