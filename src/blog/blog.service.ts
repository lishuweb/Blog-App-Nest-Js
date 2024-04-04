import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
// import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaService } from '../prisma/prisma.service';
// import { Blog } from './blog.type';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}
  //  initialize the prisma property of the BlogService class. The private keyword before the prisma property means that it can only 
  // be accessed within the BlogService class.
  async create(createBlogDto: CreateBlogDto, userId: number) 
  {
    console.log(createBlogDto, createBlogDto);
    console.log(userId, "userId");
    return await this.prisma.blog.create({
      data: {
        ...createBlogDto, 
        userId: userId
      }
    })
  }

  async findAll(isAdmin: string) 
  {
    if(isAdmin === "ADMIN")
    {
      return await this.prisma.blog.findMany({});
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action."); 
    }
  }

  async findOne(id: number, checkId: number, isAdmin: string)
  {
    const blogCreatorId = await this.prisma.blog.findUnique({
      where: {
        id: id
      }
    });
    // console.log(blogCreatorId, "blogCreatorId");

    // console.log(blogCreatorId.userId, "User Id from Blog Collection");

    if(blogCreatorId.userId === checkId || isAdmin === "ADMIN")
    {
      return await this.prisma.blog.findUnique({
        where: {
          id: id
        }
      });
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action."); 
    }
  }

  async updateById(id: number, updateBlogDto: UpdateBlogDto, checkId: number, isAdmin: string)
  {
    const findBlog = await this.prisma.blog.findUnique({
      where: {
        id: id
      }
    });
    console.log(checkId, "check Id");
    console.log(findBlog, "Find Blog For Update");
    if(findBlog.userId === checkId || isAdmin === 'ADMIN')
    {
      return await this.prisma.blog.update({
        where: {
          id
        },  
        data: updateBlogDto
      });
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action."); 
    }
  }

  async patch(id: number, updateBlogDto: UpdateBlogDto, checkId: number, isAdmin: string) 
  {
    const findBlog = await this.prisma.blog.findUnique({
      where: {
        id: id
      }
    });
    console.log(findBlog, "Blog for patch");
    if(findBlog.id === checkId || isAdmin === 'ADMIN')
    {
      return await this.prisma.blog.update({
        where: {
          id
        },
        data: updateBlogDto
      });
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action."); 
    }
  }

  async remove(id: number, isAdmin: string) 
  {
    if(isAdmin === "ADMIN")
    {
      return await this.prisma.blog.delete({
        where: { id }
      });
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action."); 
    }
  }
}
