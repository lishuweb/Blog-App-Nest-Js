import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [BlogController],
  providers: [BlogService],
  imports: [PrismaModule]
})
export class BlogModule {}
