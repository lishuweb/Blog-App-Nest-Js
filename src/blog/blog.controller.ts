import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiTags } from '@nestjs/swagger';
import { BlogEntity } from './entities/blog.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiResponse } from '@nestjs/swagger';

@Controller('api/v1/blog')
@ApiTags('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: "New Blog Created!"
  })
  @ApiCreatedResponse({ type: BlogEntity })
  async create(@Body() createBlogDto: CreateBlogDto, @Res() res, @Req () req) {
    const id = req.body.userId;
    console.log(id, "id from controllers");
    const createBlog = await this.blogService.create(createBlogDto, id);
    if(!createBlog)
    {
      throw new Error ("Error  Creating Blog");
    }
    res.json({
      status: 201,
      message: "Blog Created Successfully",
      data: createBlog,
    });
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: "All Blogs are listed from database!"
  })
  @ApiOkResponse({ type: BlogEntity, isArray: true })
  async findAll( @Res () res, @Req () req ) {
    // return [{id: 0}]
    const isAdmin = (req as any).userRoles;
    console.log(isAdmin, "Admin for blog GET");
    const getBlogs = await this.blogService.findAll(isAdmin);
    if(!getBlogs)
    {
      throw new Error ("Error Fetching Blogs From Database!");
    }
    res.json({
     status: 200,
     blogs: getBlogs
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: BlogEntity })
  async findOne(@Param('id') id: string, @Res () res, @Req () req) 
  {
    const checkId = (req as any).userId;                  //logged in user's ID
    console.log(checkId, "Id of user for BLOG");
    const isAdmin = (req as any).userRoles;               //logged in user's ROLE
    console.log(isAdmin, "Admin for blog GET");
    const getBlogById = await this.blogService.findOne(+id, checkId, isAdmin);
    if(!getBlogById)
    {
      throw new Error ("No Blog Found With Given ID!");
    }
    res.json({
      status: 200,
      getBlogById
    });
  }

  @Put(':id')
  @ApiResponse({ type: BlogEntity })
  async updateById(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @Res() res, @Req () req)
  {
    const checkId = (req as any).userId;                  //logged in user's ID
    // console.log(checkId, "Id of user for BLOG");
    const isAdmin = (req as any).userRoles;               //logged in user's ROLE
    // console.log(isAdmin, "Admin for blog GET");

    const updatedData = await this.blogService.updateById(+id, updateBlogDto, checkId, isAdmin);
    if(!updatedData)
    {
      throw new Error ("Cannot update with given id!");
    }
    res.json({
      status: 200,
      updatedData
    });
  }

  @Patch(':id')
  @ApiOkResponse({ type: BlogEntity })
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @Res () res, @Req () req) 
  {
    const checkId = (req as any).userId;                  //logged in user's ID
    // console.log(checkId, "Id of user for BLOG");
    const isAdmin = (req as any).userRoles;               //logged in user's ROLE
    // console.log(isAdmin, "Admin for blog GET");
    const patchBlog = await this.blogService.patch(+id, updateBlogDto, checkId, isAdmin);
    if(!patchBlog)
    {
      throw new Error ("Update Failed! Please Try Again Later.");
    }
    res.json({
      status: 200,
      patchBlog
    });
  }

  @Delete(':id')
  @ApiOkResponse({ type: BlogEntity })
  async remove(@Param('id') id: string, @Res () res, @Req () req) 
  {
    const isAdmin = (req as any).userRoles;               //logged in user's ROLE
    // console.log(isAdmin, "Admin for blog DELETE");
    const deleteBlog = await this.blogService.remove(+id, isAdmin);
    if(!deleteBlog)
    {
      throw new Error ("Failed to delete blog of given id!");
    }
    res.json({
      status: 200,
      message: "Blog deleted successfully!"
    });
  }
}
