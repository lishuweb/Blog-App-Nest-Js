export interface User {
    id?: number;
    name: string,
    email: string,
    password: number,
    roles: Role,
    image: string,
    isEmailVerified?: boolean,
    isActive?: boolean,
    isArchive?: boolean,
    createdBy?: boolean,
    updatedBy?: boolean
};

export enum Role {
    USER,
    ADMIN
}