import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BlogController', () => {
  let controller: BlogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [BlogService, PrismaService],
    }).compile();

    controller = module.get<BlogController>(BlogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { BlogController } from './blog.controller';
// import { BlogService } from './blog.service';
// import { CreateBlogDto } from './dto/create-blog.dto';
// // import { request } from 'http';
// import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
// // import { Res, Req } from '@nestjs/common';

// describe('BlogController', () => {
//   let app: INestApplication;
//   // let blogcontroller: BlogController;
//   let blogService: BlogService;
//   // let mockRes: any;
//   // let mockReq: any;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [BlogController],
//       providers: [
//         {
//           provide: BlogService,
//           useValue: {
//             create: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     app = module.createNestApplication();
//     // blogcontroller = module.get<BlogController>(BlogController);
//     blogService = module.get<BlogService>(BlogService);
//     // mockRes = {
//     //   json: jest.fn()
//     // } as any;
//     // mockReq = {
//     //   body: {
//     //     userId: 123
//     //   }
//     // } as any;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   // it('should be defined', () => {
//   //   expect(blogcontroller).toBeDefined();
//   // });

//   describe('create', () => {
//     it('should create a new blog and return 201 status code', async () => {
//       // const blogData = {
//       //   id: 1,
//       //   title: "Testing Nest Js Blog",
//       //   author: "Lishu",
//       //   likes: 288,
//       //   url: "https://docs.nestjs.com/",
//       // }
//       const createBlogDto: CreateBlogDto = {
//         title: "Testing Nest Js Blog",
//         author: "Lishu",
//         likes: 288,
//         url: "https://docs.nestjs.com/",
//       };
//       const userId = 1;
//       const createBlog = {
//         id: 1,
//         title: "Testing Nest Js Blog",
//         author: "Lishu",
//         likes: 288,
//         url: "https://docs.nestjs.com/",
//       };
//       blogService.create = jest.fn().mockResolvedValue(createBlog);
//       const result = await request(app.getHttpServer())
//       .post("/blogs")
//       .send({
//         ...createBlogDto,
//         userId
//       })
//       .expect(201);
//       expect(result.body.status).toBe(201);
//     expect(result.body.message).toBe('Blog Created Successfully');
//     expect(result.body.data).toEqual(createBlog);
//     expect(blogService.create).toHaveBeenCalledWith(createBlogDto, userId);
//     });
//   });

    

// });
