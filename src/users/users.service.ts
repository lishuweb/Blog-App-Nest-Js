import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { BlockUserDto, UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BcryptService } from 'utils/bcrypt';
// import { Prisma } from '@prisma/client';
// import { User } from './user.type';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService,
              private bcrypt: BcryptService  
  ) {}

  async create(createUserDto: CreateUserDto, isAdmin: boolean) {
    if(isAdmin)
    {
      const passwordHash = await this.bcrypt.bcryptPassword(createUserDto.password);
      const newUser = await this.prisma.user.create({
        data: {...createUserDto, password: passwordHash, isEmailVerified: true, isActive: true}
      });
      return newUser;
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action.");
    }
  }

  async findAll(isAdmin: boolean) {
    if(isAdmin)
    {
      return await this.prisma.user.findMany({});
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action.");
    }
  }

  async findOne(id: number, isAdmin: boolean) {
    if(isAdmin)
    {
      return await this.prisma.user.findUnique({
        where: {
          id
        }
      });
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action.");
    }
  }

  async activeVerified(isAdmin: boolean)
  {
    if(isAdmin)
    {
      return await this.prisma.user.findMany({
        where: {
          isEmailVerified: true,
          isActive: true
        }
      });
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action.");
    }
  }

  async archiveUsers(isAdmin: boolean)
  {
    if(isAdmin)
    {
      return await this.prisma.user.findMany({
        where: {
          isArchive: true
        }
      });
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action.");
    }
  }

  async updateById(id: number, updateUserDto: UpdateUserDto, isAdmin: boolean)
  {
    if(isAdmin)
    {
      return await this.prisma.user.update({
        where: {
          id
        },
        data: updateUserDto
      });
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action.");
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto, isAdmin: boolean) 
  {
    if(isAdmin)
    {
      try{
        const foundUser = await this.prisma.user.findUnique({
          where: {
            id
          }
        });
        if(!foundUser)
        {
          throw new Error ("User Not Found");
        }
        return await this.prisma.user.update({
          where: { id },
          data: updateUserDto
        });
      }
      catch(error)
      {
        throw new Error (error);
      }
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action.");
    }
  }

  async remove(id: number, isAdmin: boolean) 
  {
    if(isAdmin)
    {
      try{
        const foundUser = await this.prisma.user.findUnique({
          where: {
            id
          }
        });
        if(!foundUser)
        {
          throw new Error ("User not found based on the id!");
        }
        return await this.prisma.user.delete({
          where: { id }
        });
      }
      catch(error)
      {
        throw new Error (error);
      }
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action.");
    }
  }

  async blockUser(id: number, details: BlockUserDto, isAdmin: boolean)
  {
    if(isAdmin)
    {
      try{
        const foundUser = await this.prisma.user.findUnique({
          where: {
            id
          }
        });
        if(!foundUser)
        {
          throw new Error ("User not found");
        }
        return await this.prisma.user.update({
          where: {
            id
          },
          data: {
            isArchive: details.isActive
          }
        });
      }
      catch(error)
      {
        throw new Error (error);
      }
    }
    else 
    {
      throw new UnauthorizedException("You do not have permission to perform this action.");
    }
  }

}
