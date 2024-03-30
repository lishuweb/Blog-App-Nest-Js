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
    createdBy?: number,
    updatedBy?: number,
    currentRole?: string,
    userId?: number, 
    blogCreator?: string,
    blogUpdator?: number
};

export enum Role {
    USER,
    ADMIN
}