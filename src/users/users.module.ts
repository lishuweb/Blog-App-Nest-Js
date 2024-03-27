import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
// import { userValidation } from 'src/auth/guards/userValidationGuard';
import { userValidationMiddleware } from 'src/auth/guards/userValidationGuard';
import { BcryptService } from 'utils/bcrypt';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, BcryptService],
})
// export class UsersModule {}

export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(userValidationMiddleware).forRoutes({
      path: "api/v1/user",
      method: RequestMethod.POST
    });
  }
}
