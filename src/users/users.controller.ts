import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Res, UseInterceptors, UploadedFile, ParseFilePipe, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, BlockUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
// import { userValidation } from 'src/auth/guards/userValidationGuard';

@Controller('api/v1/user')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // @UseGuards(new userValidation(["ADMIN"]))
  @ApiResponse({
    status: 201,
    description: "New User Created!"
  })
  @ApiCreatedResponse({ type: UserEntity })

  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/user',
        filename: (req, file, cb) => {
          const uniqueSuffix = 'user' + Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('.').pop();
          cb(null, `${uniqueSuffix}.${extension}`);
        }
      })
    })
  )
  async create(
    @UploadedFile(
      new ParseFilePipe({
        // validators: [
        //   new FileTypeValidator({ fileType: '5472842.jpg' }),
        //   new MaxFileSizeValidator({ maxSize: 100000 }),
        // ],
        fileIsRequired: false
      })
    )
    file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto, @Res () res, @Req() req
  ) {
    if(file)
    {
      // console.log("Hello");
      const uniqueSuffix = Date.now() + '.' + file.originalname.split('.')[1];
      createUserDto.image = uniqueSuffix;
    }
      // const isAdmin = request.roles;
      const isAdmin = (req as any).userRoles;
      console.log(isAdmin, "isAdmin");
      createUserDto.createdBy = (req as any).userId;
      console.log((req as any).userId);
      createUserDto.currentRole = (req as any).userRoles;
      console.log((req as any).userRoles);
      const response = await this.usersService.create(createUserDto, isAdmin);
      if(!response)
      {
        throw new Error ("Error Creating User");
      }
      res.json({
        status: 201,
        message: "User Created Successfully",
        data: response,
      });
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: "All Users are listed from database!"
  })
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAll(@Res () res, @Req() req) 
  {
    const isAdmin = (req as any).userRoles;
    const response = await this.usersService.findAll(isAdmin);
    if(!response)
    {
      throw new Error ("Error Fetching Users From Database!");
    }
    res.json({
      status: 200,
      data: response,
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  async findOne(@Param('id') id: string, @Res () res, @Req() req) 
  {
    const isAdmin = (req as any).userRoles;
    const response = await this.usersService.findOne(+id, isAdmin);
    if(!response)
    {
      throw new Error ("No User Found With Given ID!");
    }
    res.json({
      status: 200,
      response
    });
  }

  @Put(':id')
  @ApiResponse({ type: UserEntity })
  async updateById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Res () res, @Req() req)
  {
    const isAdmin = (req as any).userRoles;
    const response = await this.usersService.updateById(+id, updateUserDto, isAdmin);
    if(!response)
    {
      throw new Error ("Cannot update with given id!");
    }
    res.json({
      status: 200,
      response
    });
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserEntity })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Res () res, @Req() req) 
  {
    const isAdmin = (req as any).userRoles;
    const response = await this.usersService.update(+id, updateUserDto, isAdmin);
    if(!response)
    {
      throw new Error ("Update Failed! Please Try Again Later.");
    }
    res.json({
      status: 200,
      response
    });
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserEntity })
  async remove(@Param('id') id: string, @Res() res, @Req() req) 
  {
    const isAdmin = (req as any).userRoles
    const response = await this.usersService.remove(+id, isAdmin);
    if(!response)
    {
      throw new Error ("Failed to delete blog of given id!");
    }
    res.json({
      status: 200,
      message: "Blog deleted successfully!"
    });
  }

  @Put(':id')    //User Block - isArchive: true
  @ApiResponse({ type: UserEntity })
  async blockUser(@Param('id') id: string, @Body() blockUserDto: BlockUserDto, @Res () res, @Req() req)
  {
    const isAdmin = (req as any).userRoles
    const response = await this.usersService.blockUser(+id, blockUserDto, isAdmin);
    if(!response)
    {
      throw new Error ("Cannot update with given id!");
    }
    res.json({
      status: 200,
      response
    });
  }

}

