import { Role } from "@prisma/client";

// Blog
export const blogData = {
    id: 1,
    title: "Test Blog Data",
    createdAt: new Date("2023-08-07"),
    author: "Test User",
    likes: 7878,
    url: "https://docs.nestjs.com/",
    userId: 1,
    blogUpdator: 1
};

export const blogCollections = [
    {
        id: 2,
        createdAt: new Date("2023-08-07"),
        title: "Test Blog Data",
        author: "Test User",
        likes: 7878,
        url: "https://docs.nestjs.com/",
        userId: 1,
        blogUpdator: 1,
    },
    {
        id: 3,
        createdAt: new Date("2023-08-07"),
        title: "Test Blog Data Two",
        author: "Test User",
        likes: 128,
        url: "https://docs.nestjs.com/",
        userId: 1,
        blogUpdator: 1,
    }
];

// User

// jest.mock("bcrypt", () => ({
//     hash: jest.fn().mockResolvedValue("hashedPassword"),
//     compare: jest.fn().mockResolvedValue(true)
// }));

export const userData = {
    id: 1,
    name: "test",
    email: "test@gmail.com",
    password: "Test@12345",
    image: "1710742896877-5472842.jpg",
    roles: "USER" as Role,
    isEmailVerified: true,
    isActive: true,
    isArchive: true,
    createdBy: 0,
    updatedBy: 0,
    currentRole: "USER" as Role
}

export const userCollections = [
    {
        id: 1,
        name: "test1",
        email: "test1@gmail.com",
        password: "Test@12345",
        image: "1710742896877-5472842.jpg",
        roles: "USER" as Role,
        isEmailVerified: true,
        isActive: true,
        isArchive: true,
        createdBy: 0,
        updatedBy: 0,
        currentRole: "USER" as Role
    },
    {
        id: 2,
        name: "test2",
        email: "test2@gmail.com",
        password: "Test@12345",
        image: "1710742896877-5472842.jpg",
        roles: "USER" as Role,
        isEmailVerified: true,
        isActive: true,
        isArchive: true,
        createdBy: 0,
        updatedBy: 0,
        currentRole: "USER" as Role
    }
];
