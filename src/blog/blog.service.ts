import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { blog } from '@prisma/client';

@Injectable()
export class BlogService {
  private blogs: blog[] = [];
  constructor(private prisma: PrismaService) {}
  create(createBlogDto: CreateBlogDto) {
    // return 'This action adds a new blog';
    return this.prisma.blog.create({
      data: createBlogDto
    })
  }

  findDrafts(){
    return this.prisma.blog.findMany({});
  }

  findAll() {
    // return `This action returns all blog`;
    return this.prisma.blog.findMany({})
  }

  findOne(id: number) {
    // return `This action returns a #${id} blog`;
    return this.prisma.blog.findUnique({
      where: {
        id: id
      }
    })
  }

  update(id: number, updateBlogDto: UpdateBlogDto) {
    // return `This action updates a #${id} blog`;
    return this.prisma.blog.update({
      where: { id },
      data: updateBlogDto
    });
  }

  remove(id: number) {
    // return `This action removes a #${id} blog`;
    return this.prisma.blog.delete({
      where: { id }
    });
  }

}
