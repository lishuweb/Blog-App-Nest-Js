import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from 'class-validator';
// likewise zod validator
// Data Transfer Object
export class CreateBlogDto {
    @IsString({ message: 'Ttile should be string' })
    @IsNotEmpty({ message: 'Title is required' })
    @ApiProperty({ required: true })
    title: string;

    @IsString({ message: 'Author should be string' })
    @IsNotEmpty({ message: 'Author is required' })
    @ApiProperty({ required: true })
    author: string;

    @IsString({ message: 'likes should be number' })
    @IsNotEmpty({ message: 'Likes is required' })
    @ApiProperty({ required: true })
    likes: number

    @IsNotEmpty({ message: 'Url is required' })
    @ApiProperty({ required: true })
    url: string
}
