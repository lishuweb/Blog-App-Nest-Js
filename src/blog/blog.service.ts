import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from 'src/prisma/prisma.service';
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

  async findAll() 
  {
    return await this.prisma.blog.findMany({})
  }

  async findOne(id: number)
  {
    return await this.prisma.blog.findUnique({
      where: {
        id: id
      }
    })
  }

  async updateById(id: number, updateBlogDto: UpdateBlogDto)
  {
    return await this.prisma.blog.update({
      where: {
        id
      },
      data: updateBlogDto
    });
  }

  async patch(id: number, updateBlogDto: UpdateBlogDto) 
  {
    return await this.prisma.blog.update({
      where: { id },
      data: updateBlogDto
    });
  }

  async remove(id: number) 
  {
    return await this.prisma.blog.delete({
      where: { id }
    });
  }

}
