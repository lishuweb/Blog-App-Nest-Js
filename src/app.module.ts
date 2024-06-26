import { Module } from '@nestjs/common';                            //decorator - defines structure
import { AppController } from './app.controller';                   //root module of the application
import { AppService } from './app.service';                         //root service of the application
import { PrismaModule } from './prisma/prisma.module';              //provides prisma orm 
import { BlogModule } from './blog/blog.module';
import { UsersModule } from './users/users.module';
// import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, BlogModule, UsersModule, AuthModule],                              //specifies modules that are imported
  controllers: [AppController],                                     //controllers used in the root application
  providers: [AppService],                                          //specifies providers that are used in root application
})  
export class AppModule {}
