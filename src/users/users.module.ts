import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
    // consumer.apply(userValidationMiddleware).forRoutes({
    //   path: "api/v1/user",
    //   // method: RequestMethod.POST, R
    // });
    consumer.apply(userValidationMiddleware).forRoutes(
      "api/v1/user",
      "api/v1/user/:id"
    );
  }
}


// we're using the apply method to register the middleware and the forRoutes method to specify the routes to which the middleware should be applied. 
// The 'api/v1/user' argument specifies that the middleware should be applied to specific api/v1/user routes.
