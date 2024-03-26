import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiTags } from '@nestjs/swagger';
import { BlogEntity } from './entities/blog.entity';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('/api/v1/blog')
@ApiTags('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiCreatedResponse({ type: BlogEntity })
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Get()
  @ApiOkResponse({ type: BlogEntity, isArray: true })
  findAll() {
    // return [{id: 0}]
    return this.blogService.findAll();
  }

  @Get('drafts')
  @ApiOkResponse({ type: BlogEntity, isArray: true })
  findDrafts(){
    return this.blogService.findDrafts();
  }

  @Get(':id')
  @ApiOkResponse({ type: BlogEntity })
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: BlogEntity })
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: BlogEntity })
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
