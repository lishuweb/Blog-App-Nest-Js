import { blog } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class BlogEntity implements blog {
    @ApiProperty()
    id: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    title: string

    @ApiProperty()
    author: string;

    @ApiProperty()
    likes: number

    @ApiProperty()
    url: string

    @IsOptional()
    @ApiProperty()
    userId: number;

    @IsOptional()
    @ApiProperty()
    blogCreator: number;

    @IsOptional()
    @ApiProperty()
    blogUpdator: number;
}
