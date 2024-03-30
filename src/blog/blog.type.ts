// import { user } from "@prisma/client";

export interface Blog {
    id?: number;
    createdAt?: Date; 
    title: string;
    author?: string;
    likes: number;
    url: string;
    userId?: number;
    blogCreator?: number;
    blogUpdator?: number;
}