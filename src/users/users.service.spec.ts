import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../../utils/bcrypt';
import { userCollections, userData } from '../blog/dummyTestData';
import { UnauthorizedException } from '@nestjs/common';
import { user } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let bcrypt: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            }
          }
        },
        {
          provide: BcryptService,
          useValue: {
            bcryptPassword: jest.fn(),
            comparePassword: jest.fn()
          }
        } 
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    bcrypt = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user by admin', async () => {
      const passwordHash = 'hashedPassword'
      const isAdmin = 'ADMIN';
      const bcryptHashSpy = jest.spyOn(bcrypt, 'bcryptPassword').mockResolvedValue(passwordHash);
      const prismaCreateSpy = jest.spyOn(prismaService.user, 'create').mockResolvedValue(userData);
      const result = await service.create(userData, isAdmin);
      // console.log(result, "result from user create");
      // console.log(userData, "User Data");
      expect(result).toEqual(userData);
      expect(bcryptHashSpy).toHaveBeenCalledWith(userData.password);
      expect(prismaCreateSpy).toHaveBeenCalledWith({
        data: {
          ...userData,
          password: passwordHash,
          isEmailVerified: true,
          isActive: true
        }
      });
    });

    it('should throw an UnauthorizedException if the user is not an admin', async () => {
      const isAdmin = 'USER';
      try{
        await service.create(userData, isAdmin)
      }
      catch (error) 
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });
  });

  describe('findAll', () => {
    it('should return list of users if user is admin', async () => {
      const isAdmin = 'ADMIN';
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(userCollections);
      const result = await service.findAll(isAdmin);
      // console.log(result, "result from find all user");
      expect(result).toEqual(userCollections);
      expect(result).toBeDefined();
      // expect(prismaFindManySpy).toHaveBeenCalledWith();
    });

    it('should throw an UnauthorizedException if the user is not an admin', async () => {
      const isAdmin = 'USER';
      try{
        await service.findAll(isAdmin)
      }
      catch (error) 
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });
  });

  describe('findOne', () => {
    it('should return a single user object with given id only for admin', async () => {
      const isAdmin = 'ADMIN';
      const prismaFindUniqueSpy = jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(userData);
      const result = await service.findOne(userData.id, isAdmin);
      console.log(result, "result from find one user");
      expect(result).toEqual(userData);
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id: userData.id
        }
      });
    });

    it('should throw an UnauthorizedException if the user is not an admin', async () => {
      const isAdmin = 'USER';
      try{
        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
        await service.findOne(userData.id, isAdmin)
      }
      catch (error) 
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });
  });

  describe('activeVerified', () => {
    it('should return active and verified users for admin', async () => {
      const isAdmin = 'ADMIN';
      const prismaFindManySpy = jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(userCollections);
      const result = await service.activeVerified(isAdmin);
      // console.log(result, "result from activeVerified");
      expect(result).toEqual(userCollections);
      expect(prismaFindManySpy).toHaveBeenCalledWith({
        where: {
          isEmailVerified: true,
          isActive: true
        }
      });
    });

    it('should throw an UnauthorizedException if the user is not an admin', async () => {
      const isAdmin = 'USER';
      try{
        await service.activeVerified(isAdmin);
      }
      catch(error)
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });
  });

  describe('archiveUsers', () => {
    it('should return archived users for admin', async () => {
      const isAdmin = 'ADMIN';
      const prismaFindManySpy = jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(userCollections as user[]);
      const result = await service.archiveUsers(isAdmin);
      // console.log(result, "result from archiveUsers");
      // console.log(userCollections, "userCollections");
      expect(result).toEqual(userCollections);
      expect(prismaFindManySpy).toHaveBeenCalledWith({
        where: {
          isArchive: true
        }
      });
    });

    it('should throw an UnauthorizedException if the user is not an admin', async () => {
      const isAdmin = 'USER';
      try{
        await service.archiveUsers(isAdmin);
      }
      catch(error)
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });
  });

  describe('updateById', () => {
    it('should update fields of user by id and return updated user info, if user is admin', async () => {
      const isAdmin = 'ADMIN';
      const updateUser = {
        id: userData.id,
        name: "Updated Name",
        email: "updated@gmail.com",
        password: userData.password,
        image: userData.image,
        roles: userData.roles,
        isEmailVerified: userData.isEmailVerified,
        isActive: userData.isActive,
        isArchive: userData.isArchive,
        createdBy: userData.createdBy,
        updatedBy: userData.updatedBy,
        currentRole: userData.roles
      };
      const prismaUpdateSpy = jest.spyOn(prismaService.user, 'update').mockResolvedValue(updateUser);
      const result = await service.updateById(updateUser.id, updateUser, isAdmin);
      // console.log(result, "result from updateById");
      expect(result).toEqual(updateUser);
      expect(prismaUpdateSpy).toHaveBeenCalledWith({
        where: {
          id: updateUser.id
        },
        data: updateUser
      });
    });

    it('should throw an UnauthorizedException if the user is not an admin', async () => {
      const isAdmin = 'USER';
      const updateUser = {
        id: userData.id,
        name: "Updated Name",
        email: "updated@gmail.com",
        password: userData.password,
        image: userData.image,
        roles: userData.roles,
        isEmailVerified: userData.isEmailVerified,
        isActive: userData.isActive,
        isArchive: userData.isArchive,
        createdBy: userData.createdBy,
        updatedBy: userData.updatedBy,
        currentRole: userData.roles
      };
      try{
        await service.updateById(updateUser.id, updateUser, isAdmin);
      }
      catch(error)
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });
  });

  describe('update', () => {                                  //patch
    it('should update fields of user by id and return updated user info, if user is admin', async () => {
      const isAdmin = 'ADMIN';
      const updateUser = {
        id: userData.id,
        name: "Updated Name Patch",
        email: userData.email,
        password: userData.password,
        image: userData.image,
        roles: userData.roles,
        isEmailVerified: userData.isEmailVerified,
        isActive: userData.isActive,
        isArchive: userData.isArchive,
        createdBy: userData.createdBy,
        updatedBy: userData.updatedBy,
        currentRole: userData.roles
      };
      const prismaFindUniqueSpy = jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({id: updateUser.id} as user);
      const prismaUpdateSpy = jest.spyOn(prismaService.user, 'update').mockResolvedValue(updateUser as user);
      const result = await service.update(updateUser.id, updateUser, isAdmin);
      // console.log(result, "result from update success");
      // console.log(userData, "userData from update");
      expect(result).toEqual(updateUser);
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id: userData.id
        }
      });
      expect(prismaUpdateSpy).toHaveBeenCalledWith({
        where: {
          id: userData.id
        },
        data: updateUser
      });
    });

    it('should throw an error if user is not found', async () => {
      const isAdmin = 'ADMIN';
      const wrongId = 44;
      const updateUser = {
        name: "Updated Name Patch"
      };
      await expect(service.update(wrongId, updateUser, isAdmin)).rejects.toThrow('User Not Found');
    });

    it('should throw an UnauthorizedException if the user is not an admin', async () => {
      const isAdmin = 'USER';
      const updateUser = {
        name: "Updated Name Patch"
      };
      try{
        await service.update(userData.id, updateUser, isAdmin);
      }
      catch(error)
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });
  });

  describe('delete', () => {
    it('should delete the details using the id of the given user by admin', async () => {
      const isAdmin = 'ADMIN';
      const prismaFindUniqueSpy = jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({id: userData.id} as user);
      const prismaDeleteSpy = jest.spyOn(prismaService.user, 'delete').mockResolvedValue(userData);
      const result = await service.remove(userData.id, isAdmin);
      expect(result).toBeDefined();
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id: userData.id
        }
      });
      expect(prismaDeleteSpy).toHaveBeenCalledWith({
        where: {
          id: userData.id
        }
      });
    });

    it('should throw an error if user is not found', async () => {
      const wrongId = 123;
      const isAdmin = 'ADMIN';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      await expect(service.remove(wrongId, isAdmin)).rejects.toThrow('User not found based on the id!');
    });

    it('should throw an UnauthorizedException if the user is not an admin', async () => {
      const isAdmin = 'USER';
      try{
        await service.remove(userData.id, isAdmin);
      }
      catch(error)
      {
        expect(error).toEqual(new UnauthorizedException("You do not have permission to perform this action."));
      }
    });
  });

  describe('blockUser', () => {
    it('should block user using given id by the admin', async () => {
      const isAdmin = 'ADMIN';
      const blockData = {
        isArchive: true
      };
      const prismaFindUniqueSpy = jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(blockData as user);
      const prismaUpdateSpy = jest.spyOn(prismaService.user, 'update').mockResolvedValue(userData);
      const result = await service.blockUser(userData.id, blockData, isAdmin);
      console.log(result, "result from block user");
      expect(result).toEqual(userData);
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          id: userData.id
        }
      });
      expect(prismaUpdateSpy).toHaveBeenCalledWith({
        where: {
          id: userData.id
        },
        data: blockData
      });
    });
  });
});
