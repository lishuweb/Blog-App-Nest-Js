import { user, Role } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

// export enum Role{
//     // USER="USER"
//     // ADMIN="ADMIN"
//     USER
//     ADMIN
// }
export class AuthEntity implements user {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string

    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string

    @ApiProperty()
    roles: Role

    @ApiProperty()
    image: string

    @ApiProperty()
    isEmailVerified: boolean

    @ApiProperty()
    isActive: boolean

    @ApiProperty()
    isArchive: boolean

    @ApiProperty()
    createdBy: number

    @ApiProperty()
    currentRole: Role
}
