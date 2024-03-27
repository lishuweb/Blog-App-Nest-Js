import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main()
{
    const blog1 = await prisma.blog.upsert({
        // where: { title: 'Blog Related To Nest Js' },
        where: { id: 1 },
        update: {},
        create: {
            title: 'Blog Related To Nest Js',
            author: 'Nest Author',
            likes: 20,
            url: 'https://docs.nestjs.com/'
        },
    });

    const blog2 = await prisma.blog.upsert({
        // where: { title: 'Nest Js vs Express Js' },
        where: { id: 2 },
        update: {},
        create: {
            title: 'Nest Js vs Express Js',
            author: 'Lishu Author',
            likes: 99,
            url: 'https://docs.nestjs.com/'
        },
    });

    const userData = {
        name: "Jhamsikhel",
        email: "jhamsikhel@gmail.com",
        password: "jhamsikhel@1",
        image: "jhamPic",
      };

    const user1 = await prisma.user.upsert({
        where: { email: "jhamsikhel@gmail.com" },
        update: {},
        create: {
            ...userData,
        },
    });

    console.log({ blog1, blog2 });
    console.log({ user1 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });