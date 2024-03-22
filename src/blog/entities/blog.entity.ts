import { blog } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

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
}
