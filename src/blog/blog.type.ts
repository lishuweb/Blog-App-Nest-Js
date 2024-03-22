export interface Blog {
    id?: number;
    createdAt?: Date; 
    title: string;
    author?: string;
    likes: number;
    url: string;
}