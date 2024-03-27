import { Injectable } from '@nestjs/common';
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
      throw new Error ("No Admin!");
    }
  }

  async findAll() {
    return await this.prisma.user.findMany({});
  }

  async findOne(id: number) {
    return await this.prisma.user.findUnique({
      where: {
        id
      }
    });
  }

  async updateById(id: number, updateUserDto: UpdateUserDto)
  {
    return await this.prisma.user.update({
      where: {
        id
      },
      data: updateUserDto
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) 
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

  async remove(id: number) 
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

  async blockUser(id: number, details: BlockUserDto)
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
}
