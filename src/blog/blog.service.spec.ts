import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';
// import { CreateBlogDto } from './dto/create-blog.dto';
import { blogData, blogCollections } from './dummyTestData';
import { blog } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

describe('BlogService', () => {
  // let controller: BlogController;
  let service: BlogService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: PrismaService,
          useValue: {
            blog: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            },
          },
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new blog post with the given data and userID', async () => {
      const userId = 1;
      const prismaCreateSpy = jest.spyOn(prismaService.blog, 'create').mockResolvedValue(blogData as blog);
      const result = await service.create(blogData, userId);
      // console.log(result, "result from creating blog");
      expect(result).toEqual(blogData);
      expect(prismaCreateSpy).toHaveBeenCalledWith({
        data: {
          ...blogData,
          userId: userId
        }
      });
    });
  });

  describe('findAll', () => {
    it('should return all the blogs from database', async () => {
      const isAdmin = 'ADMIN';
      const prismaCreateSpy = jest.spyOn(prismaService.blog, 'findMany').mockResolvedValue(blogCollections);
      const result = await service.findAll(isAdmin);
      // console.log(result, "result from getting all blogs");
      expect(result).toEqual(blogCollections);
      expect(prismaCreateSpy).toHaveBeenCalled();
    });

    it('should throw an UnauthorizedException if the user is not an admin', async () => {
      const isAdmin = 'USER';
      const prismaCreateSpy = jest.spyOn(prismaService.blog, 'findMany').mockResolvedValue([]);
      try 
      {
        await service.findAll(isAdmin);
      } 
      catch (error) 
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
      expect(prismaCreateSpy).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it('should successfully update a blog post when the user is the owner', async () => {
      const isAdmin = 'USER';
      const checkId = blogData.id;
      const id = blogData.id;
     
      const prismaFindUniqueSpy = jest.spyOn(prismaService.blog, 'findUnique').mockResolvedValue(blogData);
      const result = await service.findOne(id, checkId, isAdmin);
      console.log(result, "result from find one blog user");
      expect(result).toEqual(blogData);
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id
        }
      });
    });

    it('should successfully update a blog post when the user is the admin', async () => {
      const isAdmin = 'ADMIN';
      const checkId = 33;
      const id = blogData.id;

      const expectedBlog = {
        ...blogData,
        userId: checkId
      };
     
      const prismaFindUniqueSpy = jest.spyOn(prismaService.blog, 'findUnique').mockResolvedValue(expectedBlog);
      const result = await service.findOne(id, checkId, isAdmin);
      console.log(result, "result from find one blog admin");
      console.log(blogData, "blogdata");
      expect(result).toEqual(expectedBlog);
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id
        }
      });
    });

    it('should throw an UnauthorizedException if the user is not an admin or userId does not matches the request body id', async () => {
      const isAdmin = 'USER';
      const checkId = 22;
      // const id = blogData.id;
      const prismaFindUniqueSpy = jest.spyOn(prismaService.blog, 'findUnique').mockResolvedValue(blogData);
      try{
        await service.findOne(blogData.id, checkId, isAdmin);
      }
      catch(error)
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id: blogData.id
        }
      });
    });
  });

  describe('updateById', () => {
    it('should successfully update a blog post when the user is the admin', async () => {
      const isAdmin = 'ADMIN';
      const checkId = blogData.id;
      const blogId = 18;

      const blogToUpdate = {
        id: blogId,
        title: blogData.title,
        author: blogData.author,
        likes: 555,
        url: blogData.url,
        userId: blogData.userId
      };

      const prismaFindUniqueSpy = jest.spyOn(prismaService.blog, 'findUnique').mockResolvedValue({ id:blogId } as blog);
      const prismaUpdateSpy = jest.spyOn(prismaService.blog, 'update').mockResolvedValue({...blogToUpdate, id: blogId } as blog);
      const result = await service.updateById(blogId, blogToUpdate, checkId, isAdmin);
      // console.log(result, "result from update by id admin");
      expect(result).toEqual(blogToUpdate);
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id: blogId
        }
      });
      expect(prismaUpdateSpy).toHaveBeenCalledWith({
        where: {
          id: blogId
        },
        data: blogToUpdate
      });
    });

    it('should successfullt update a blog post when the user is the owner', async () => {
      const isAdmin = 'USER';
      const checkId = blogData.id;
      const blogId = blogData.id;

      const blogToUpdate = {
        id: blogData.id,
        title: blogData.title,
        author: blogData.author,
        likes: 555,
        url: blogData.url,
        userId: blogData.userId
      };

      const prismaFindUniqueSpy = jest.spyOn(prismaService.blog, 'findUnique').mockResolvedValue({ id:blogId, userId: checkId } as blog);
      const prismaUpdateSpy = jest.spyOn(prismaService.blog, 'update').mockResolvedValue({...blogToUpdate, id: blogId, userId: checkId} as blog);
      const result = await service.updateById(blogId, blogToUpdate, checkId, isAdmin);
      // console.log(result, "result from update by id user");
      expect(result).toEqual(blogToUpdate);
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id: blogId
        }
      });
      expect(prismaUpdateSpy).toHaveBeenCalledWith({
        where: {
          id: blogId
        },
        data: blogToUpdate
      });
    });

    it('should throw an UnauthorizedException if the user is not an admin or userId does not matches the request body id', async () => {
      const isAdmin = 'USER';
      const checkId = 12;
      const id = blogData.id;
      const blogToUpdate = {
        id: blogData.id,
        title: blogData.title,
        author: blogData.author,
        likes: 3000,
        url: blogData.url,
        userId: blogData.userId
      };

      jest.spyOn(prismaService.blog, 'findUnique').mockResolvedValue({id, userId: checkId} as blog);

      try {
        await service.updateById(id, blogToUpdate, checkId, isAdmin);
      } 
      catch (error) 
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });

  });

  describe('patch', () => {
    it('should successfully update a blog post when the user is the owner', async () => {
      const isAdmin = 'USER';
      const checkId = blogData.id;
      const id = blogData.id;
      const blogToUpdate = {
        title: 'Patch Title'
      };

      const prismaFindUniqueSpy = jest.spyOn(prismaService.blog, 'findUnique').mockResolvedValue({ id, userId: checkId } as blog);
      const prismaUpdateSpy = jest.spyOn(prismaService.blog, 'update').mockResolvedValue( {...blogData, id, userId: checkId} );
      await service.patch(blogData.id, blogToUpdate, checkId, isAdmin);
      // console.log(result, "result from patch test user");

      // expect(result).toEqual(blogData);
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id
        }
      });
      expect(prismaUpdateSpy).toHaveBeenCalledWith({
        where: {
          id
        },
        data: blogToUpdate
      });
    });

    it('should successfully update a blog post when the user is the admin', async () => {
      const isAdmin = 'ADMIN';
      const checkId = blogData.id;
      const blogId = 22;
      const blogToUpdate = {
        title: 'Patch Title'
      };
      const prismaFindUniqueSpy = jest.spyOn(prismaService.blog, 'findUnique').mockResolvedValue({ id: blogId } as blog);
      const prismaUpdateSpy = jest.spyOn(prismaService.blog, 'update').mockResolvedValue({ ...blogData, id: blogId });
      await service.patch(blogId, blogToUpdate, checkId, isAdmin);
      // console.log(result, "result from patch test admin");

      // expect(result).toEqual(blogToUpdate);
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id: blogId
        }
      });
      expect(prismaUpdateSpy).toHaveBeenCalledWith({
        where: {
          id: blogId
        },
        data: blogToUpdate
      });
    });

    it('should throw an UnauthorizedException when the user is neither the owner nor an admin', async () => {
      const isAdmin = 'USER';
      const checkId = 90;
      const id = 44;
      const blogToUpdate = {
        title: 'Patch Update Blog'
      };
      jest.spyOn(prismaService.blog, 'findUnique').mockResolvedValue({ id, userId: checkId } as blog);
      try {
        await service.patch(id, blogToUpdate, checkId, isAdmin);
      } 
      catch (error) 
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });
  });

  describe('delete', () => {
    it('should successfully delete blog if user is admin', async () => {
      const isAdmin = 'ADMIN';
      const prismaDeleteSpy = jest.spyOn(prismaService.blog, 'delete').mockResolvedValue(blogData);
      const result = await service.remove(blogData.id, isAdmin);
      expect(result).toEqual(blogData);
      expect(prismaDeleteSpy).toHaveBeenCalledWith({
        where: {
          id: blogData.id
        }
      });
    });

    it('should throw an UnauthorizedException when the user is neither the owner nor an admin', async () => {
      const isAdmin = 'USER';
      jest.spyOn(prismaService.blog, 'delete').mockResolvedValue(blogData);
      try {
        await service.remove(blogData.id, isAdmin);
      } 
      catch (error) 
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });
  });

});