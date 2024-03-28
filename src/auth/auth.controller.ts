import { Controller, Post, Body, Put, UploadedFile, ParseFilePipe, Res, UseInterceptors, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginAuthDto, ForgotPasswordTokenDto, ForgotPasswordDto, ChangePasswordTokenDto, ChangePasswordDto } from './dto/create-auth.dto';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('api/v1/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'The found records',
  })
  @ApiCreatedResponse({ type: AuthEntity })
  async getAll(@Res () res)
  {
    const response = await this.authService.getAuth();
    if(!response)
    {
      throw new Error ("Auth USers Not Available!");
    }
    res.json({
      status: 200,
      message: "Auth Users",
      data: response,
    })
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: "New User Created!"
  })
  @ApiCreatedResponse({ type: AuthEntity })

  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/user',
        filename: (req, file, cb) => {
          const uniqueSuffix = 'user' + Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('-').pop();
          cb(null, `${uniqueSuffix}.${extension}`);
        }
      })
    })
  )
  async create(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false
      })
    )
    file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,  @Res () res
  ) {
    if(file)
    {
      const uniqueSuffix = Date.now() + '.' + file.originalname.split('.')[1];
      createUserDto.image = uniqueSuffix;
    }
    const response = await this.authService.create(createUserDto);
    if(!response)
    {
      throw new Error ("Error Creating User");
    }
    res.json({
      status: 201,
      message: "Auth User Created Successfully",
      data: response,
    });
  }

  @Post('verify')
  @ApiResponse({
    status: 200,
    description: "User Verified!"
  })
  @ApiCreatedResponse({ type: AuthEntity })
  async userVerify(@Body() createAuthDto: CreateAuthDto,  @Res () res)
  {
    const response = await this.authService.verifyUser(createAuthDto);
    res.json({
      status: 200,
      message: "Auth User Verified!",
      data: response,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: "User Logged In!"
  })
  @ApiCreatedResponse({ type: AuthEntity })
  async login(@Body() loginAuthDto: LoginAuthDto, @Res () res)
  {
    const response = await this.authService.login(loginAuthDto);
    res.json({
      status: 200,
      message: "User Logged In!",
      data: response,
    });
  }

  @Post('forgotPasswordToken')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: "Forgot Password token sent!",
  })
  async forgotPasswordToken(@Body() forgotPasswordTokenDto: ForgotPasswordTokenDto, @Res () res)
  {
    const response = await this.authService.forgotPasswordToken(forgotPasswordTokenDto.email);
    if(!response)
    {
      throw new Error ("Error in forgot password token!");
    }
    res.json({
      status: 200,
      message: "Forgot Password token sent!",
      data: response,
    });
  }

  @Post('forgotPassword')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: "Forgot Password Done!",
  })
  async forgotPassword(@Body() forgotPassword: ForgotPasswordDto, @Res() res)
  {
    const response = await this.authService.forgotPassword(forgotPassword);
    if(!response)
    {
      throw new Error ("Error in forgot password!");
    }
    res.json({
      status: 200,
      message: "Forgot Password Done!",
      data: response,
    });
  }

  @Post("changePasswordToken")
  @ApiResponse({
    status: 200,
    description: "Change password token sent!"
  })
  async changePasswordToken(@Body() changePasswordTokenDto: ChangePasswordTokenDto, @Res () res)
  {
    const response = await this.authService.changePasswordToken(changePasswordTokenDto);
    if(!response)
    {
      throw new Error ("Error in change password token!");
    }
    res.json({
      status: 200,
      message: "Change password token sent!",
      data: response
    });
  }

  @Put('changePassword')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: "Change password done!"
  })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Res () res)
  {
    const response = await this.authService.changePassword(changePasswordDto);
    if(!response)
    {
      throw new Error ("Error in change password!");
    }
    res.json({
      status: 200,
      message: "Change Password Done!",
      data: response,
    });
  }

}
