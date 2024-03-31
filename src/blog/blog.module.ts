import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { tokenExtractorMiddleware } from 'src/auth/guards/tokenExtractor';
import { userValidationMiddleware } from 'src/auth/guards/userValidationGuard';
import { RequestMethod } from '@nestjs/common';

@Module({
  controllers: [BlogController],
  providers: [BlogService],
  imports: [PrismaModule]
})
// export class BlogModule {}

export class BlogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(tokenExtractorMiddleware).forRoutes(
      "api/v1/blog",
      "api/v1/blog/:id",
    );

    consumer.apply(userValidationMiddleware).forRoutes(
      { path: 'api/v1/blog', method: RequestMethod.GET }
    );

    consumer.apply(userValidationMiddleware).forRoutes(
      { path: 'api/v1/blog/:id', method: RequestMethod.GET }
    );
  }
}
