import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../../utils/bcrypt';
import * as OTP from '../../utils/otp';
import * as mail from '../../utils/mail';
import * as JWT from '../../utils/jwt';
import { accessToken, authData, refreshToken, userData } from '../blog/dummyTestData';
import { Role, auth, user } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let bcrypt: BcryptService;

  jest.mock("bcrypt", () => ({
    hash: jest.fn().mockResolvedValue("hashedPassword"),
    compare: jest.fn().mockResolvedValue(true)
  }));

  jest.mock('../../utils/otp', () => ({
    generateOTP: jest.fn().mockResolvedValue(123456), // mockResolvedValue for async consistency
    verifyOTP: jest.fn(),
  }));

  jest.mock("../../utils/mail", () => ({
    // Ensure mail is a jest.fn() to be able to use Jest methods like toHaveBeenCalledWith
    mail: jest.fn().mockImplementation(() => "abc@gmail.com"),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService, 
        {
          provide: PrismaService,
          useValue: {
            auth: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn()
            },
            user: {
              create: jest.fn(),
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
        },
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    bcrypt = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('create new user', async () => {
      jest.spyOn(bcrypt, 'bcryptPassword').mockResolvedValue("hashedPassword");
      jest.spyOn(OTP, 'generateOTP').mockReturnValue("123456" as never);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(userData as user);
      jest.spyOn(prismaService.auth, 'create').mockResolvedValue(authData as auth);
      jest.spyOn(mail, 'mail').mockResolvedValue(true);
      const createData = {
        name: "test",
        email: "test@gmail.com",
        password: "hashedPassword",
        image: "1710742896877-5472842.jpg",
      }
      const result = await service.create(userData);
      // console.log(result, "result from auth create");
      expect(result).toEqual(userData);
      expect(bcrypt.bcryptPassword).toHaveBeenCalledWith(createData.password);
      expect(OTP.generateOTP).toHaveBeenCalledWith();
      const authUserCreate = await prismaService.auth.create({
        data: authData
      });
      expect(authUserCreate).toEqual(authData);
      expect(prismaService.auth.create).toHaveBeenCalledWith({
        data: authData
      });
      expect(mail.mail).toHaveBeenCalledWith(authData.email, 123456);
    });
  });

  describe('verifyUser', () => {
    it('should verify the auth user', async () => {
      const authUser = {
        email: 'test@example.com',
        token: 123456
    };
      const prismaFindUniqueSpy = jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(authUser as auth);
      const prismaUserUpdateSpy = jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        isEmailVerified: true,
        isActive: true
      } as user);
      const prismaAuthDeleteSpy = jest.spyOn(prismaService.auth, 'delete').mockResolvedValue(authUser as auth);
      const validTokenSpy = jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);
      const result = await service.verifyUser({...authUser, token: '123456'});
      // console.log(result, "result from verify user");
      expect(result).toBe("Account Verification Successful!");

      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          email: authUser.email
        }
      });
      expect(prismaAuthDeleteSpy).toHaveBeenCalledWith({
        where: {
          email: authUser.email
        }
      });
      expect(prismaUserUpdateSpy).toHaveBeenCalledWith({
        where: {
          email: authUser.email
        },
        data: {
          isEmailVerified: true,
          isActive: true
        }
      });
      expect(validTokenSpy).toHaveBeenCalledWith(String(authUser.token));
    });

    it('should throw error if user is not found', async () => {
      jest.clearAllMocks();
      const data = {
        email: "a@gmail.com",
        token: 123456
      };
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(null);
      // const result = await service.verifyUser(data);
      // console.log(result, "result from error 1");
      // expect(result).rejects.toThrow("Auth User Not Found, Do Register First");
      await expect(service.verifyUser(data)).rejects.toThrow("Auth User Not Found, Do Register First");
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: "a@gmail.com"
        }
      });
    });

    it('should throw error if token is not valid', async () => {
      jest.clearAllMocks();
      const data = {
        email: authData.email,
        token: 123456
      };
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue({
        email: data.email,
        token: data.token
      } as auth);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(false);
      // const result = await service.verifyUser(data);
      // console.log(result, "result from token invalid");
      // expect(result).rejects.toThrow("Token is valid!");
      await expect(service.verifyUser(data)).rejects.toThrow("Token in valid!");
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith(data.token);
    });

    it('should throw error if token is mismatched', async () => {
      jest.clearAllMocks();
      const data = {
        email: authData.email,
        token: 112233
      };
      const prismaFindUniqueSpy = jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue({
        email: data.email,
        token: data.token
      } as auth);
      const prismaTokenSpy = jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);
      // const result = await service.verifyUser(data);
      // console.log(result, "result from token invalid");
      // expect(result).rejects.toThrow("Token is mismatched!");
      await expect(service.verifyUser(data)).rejects.toThrow("Token is mismatched!");
      expect(prismaFindUniqueSpy).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
      expect(prismaTokenSpy).toHaveBeenCalledWith(data.token);
    });
  });

  describe('login', () => {
    it('should return user object on successful login', async () => {
      jest.clearAllMocks();
      const loginData = {
        email: userData.email,
        password: userData.password
      }
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(userData);
      jest.spyOn(bcrypt, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(JWT, 'generateJWT').mockReturnValue(accessToken);
      jest.spyOn(JWT, 'generateRefreshToken').mockReturnValue(refreshToken);
      const result = await service.login(loginData);
      // console.log(result, "result from login");
      const userForToken = {
        id: userData.id,
        email: userData.email,
        name: userData.name
      };
      // console.log(userForToken, "userForToken");
      expect(result).toEqual({
        userForToken,
        accessToken,
        refreshToken
      });
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email
        }
      });
      expect(bcrypt.comparePassword).toHaveBeenCalledWith(loginData.password, 'hashedPassword');
      expect(JWT.generateJWT).toHaveBeenCalledWith(userForToken);
      expect(JWT.generateRefreshToken).toHaveBeenCalledWith(userForToken);
    });

    it('should throw error if user is not found', async () => {
      jest.clearAllMocks();
      const loginData = {
        email: "hello@gmail.com",
        password: userData.password
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      await expect(service.login(loginData)).rejects.toThrow("User not Found!");
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email
        }
      });
    });

    it('should throw error if email is not verified and is not active', async () => {
      jest.clearAllMocks();
      const loginData = {
        id: 1,
        name: "test",
        email: "test@gmail.com",
        // password: "Test@12345",
        password: 'hashedPassword',
        image: "1710742896877-5472842.jpg",
        roles: "USER" as Role,
        isEmailVerified: false,
        isActive: false,
        isArchive: false,
        createdBy: 0,
        updatedBy: 0,
        currentRole: "USER" as Role
      }
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(loginData);
      await expect(service.login({email: loginData.email, password: loginData.password})).rejects.toThrow("Email is not verified and is not active!");
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email
        }
      });
    });

    it('should throw error if password doesnot matches', async () => {
      const loginData = {
        email: userData.email,
        password: "invalidPassword"
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(userData);
      jest.spyOn(bcrypt, 'comparePassword').mockResolvedValue(false);
      await expect(service.login(loginData)).rejects.toThrow("Password did not matched!");
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email
        }
      });
      expect(bcrypt.comparePassword).toHaveBeenCalledWith(loginData.password, 'hashedPassword');
    });
  });

  describe('forgotPasswordToken', () => {
    it('should provide OTP Token for forgot password', async () => {
      jest.clearAllMocks();
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(userData);
      jest.spyOn(OTP, 'generateOTP').mockReturnValue('123456');
      const data = {
        email: userData.email,
        token: 123456
      };
      jest.spyOn(prismaService.auth, 'create').mockResolvedValue(data as auth);
      const result =await service.forgotPasswordToken(userData.email);
      // console.log(result, "result from forgot password token");
      expect(result).toBe(true);
      expect(mail.mail).toHaveBeenCalledWith("test@gmail.com", 123456);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: userData.email,
          isEmailVerified: userData.isEmailVerified,
          isActive: userData.isActive
        }
      });
      expect(OTP.generateOTP).toHaveBeenCalledWith();
      expect(prismaService.auth.create).toHaveBeenCalledWith({
        data: data
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.clearAllMocks();
      const email = 'InvalidEmail';
      try{
        await service.forgotPasswordToken(email);

      }
      catch(error)
      {
        expect(error).toEqual(new NotFoundException(`User not found for email: ${email}`));
      }
    });
  });

  describe('forgotPassword', () => {
    it('should generate new password if user forgets password', async () => {
      jest.clearAllMocks();
      const data = {
        email:  userData.email,
        password: "forgotPassword",
        token: 123456
      };
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(authData as auth);
      jest.spyOn(OTP, 'verifyOTP').mockReturnValue(true as never);
      jest.spyOn(bcrypt, 'bcryptPassword').mockResolvedValue("hashedPassword");
      const result = await service.forgotPassword(data);
      // console.log(result, "result from forgot password");
      expect(result).toBe(true);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        email: data.email
      } as user);
      jest.spyOn(prismaService.auth, 'delete').mockResolvedValue(authData as auth);
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith("123456");
      expect(bcrypt.bcryptPassword).toHaveBeenCalledWith(data.password);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: {
          email: data.email
        },
        data: {
          password: 'hashedPassword'
        }
      });
      expect(prismaService.auth.delete).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.clearAllMocks();
      const data = {
        email: 'InvalidEmail',
        password: userData.password,
        token: authData.token
      }
      try{
        await service.forgotPassword(data);
      }
      catch(error)
      {
        expect(error).toEqual(new NotFoundException(`User not found for email: ${data.email}`));
      }
    });

    it('should throw error if token is invalid', async () => {
      jest.clearAllMocks();
      const data = {
        email:  userData.email,
        password: "forgotPassword",
        token: 123456
      };
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(authData as auth);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(false);
      // const result = await service.forgotPassword(data);
      // console.log(result, "result from token invalid");
      await expect(service.forgotPassword(data)).rejects.toThrow("Invalid OTP Token!");
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith("123456");
    });

    it('should throw error if token is mismatched', async () => {
      jest.clearAllMocks();
      const data = {
        email:  userData.email,
        password: "forgotPassword",
        token: 112233
      };
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(authData as auth);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);
      // const result = await service.forgotPassword(data);
      // console.log(result, "result from token invalid");
      await expect(service.forgotPassword(data)).rejects.toThrow("OTP Token Mismatched!");
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
    });
  });

  describe('changePasswordToken', () => {
    it('should generate token for change password', async () => {
      jest.clearAllMocks();
      const data = {
        email: userData.email,
        token: 123456 
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(userData);
      jest.spyOn(OTP, 'generateOTP').mockReturnValue("123456");
      jest.spyOn(prismaService.auth, 'create').mockResolvedValue(data as auth);
      const result = await service.changePasswordToken(data);
      console.log(result, "result from change password token");
      expect(result).toBe(true);
      expect(mail.mail).toHaveBeenCalledWith(data.email, data.token);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: userData.email,
          isEmailVerified: userData.isEmailVerified,
          isActive: userData.isActive
        }
      });
      expect(OTP.generateOTP).toHaveBeenCalledWith();
      expect(prismaService.auth.create).toHaveBeenCalledWith({
        data: data
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.clearAllMocks();
      const data = {
        email: "invalidEmail",
        token: 123456
      };
      try{
        await service.changePasswordToken(data);

      }
      catch(error)
      {
        expect(error).toEqual(new NotFoundException(`User not found for email: ${data.email}`));
      }
    });
  });

  describe('changePassword', () => {
    it('should change password for the user', async () => {
      jest.clearAllMocks();
      const data = {
        email: userData.email,
        oldPassword: userData.password,
        newPassword: "Newpassword@1",
        token: 123456
      };
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(authData as auth);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(userData);
      jest.spyOn(bcrypt, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'bcryptPassword').mockResolvedValue(data.newPassword);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(userData);
      jest.spyOn(prismaService.auth, 'delete').mockResolvedValue(authData as auth);
      const result = await service.changePassword(data);
      console.log(result, "result from change password");
      expect(result).toBe(true);
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith("123456");
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: userData.email,
          isEmailVerified: userData.isEmailVerified,
          isActive: userData.isActive
        }
      });
      expect(bcrypt.comparePassword).toHaveBeenCalledWith(data.oldPassword, 'hashedPassword');
      expect(bcrypt.bcryptPassword).toHaveBeenCalledWith(data.newPassword);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: {
          email: data.email
        },
        data: {
          password: 'Newpassword@1'
        } 
      });
      expect(prismaService.auth.delete).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
    });

    it('should throw NotFoundException if auth user is not found', async () => {
      jest.clearAllMocks();
      const data = {
        email: "InvalidEmail",
        oldPassword: userData.password,
        newPassword: "Newpassword@1",
        token: 123456
      };
      try{
        await service.changePassword(data);
      }
      catch(error)
      {
        expect(error).toEqual(new NotFoundException(`User not found for email: ${data.email}`));
      }
    });

    it('should throw error if token is invalid', async () => {
      jest.clearAllMocks();
      const data = {
        email: "InvalidEmail",
        oldPassword: userData.password,
        newPassword: "Newpassword@1",
        token: 123456
      };
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(authData as auth);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(false);
      try{
        await service.changePassword(data);
      }
      catch(error)
      {
        expect(error).toEqual(new BadRequestException('Invalid OTP'));
      }
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith("123456");
    });

    it('should throw error if token is mismatched', async () => {
      jest.clearAllMocks();
      const data = {
        email: "InvalidEmail",
        oldPassword: userData.password,
        newPassword: "Newpassword@1",
        token: 112233
      };
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(authData as auth);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);
      try{
        await service.changePassword(data);
      }
      catch(error)
      {
        expect(error).toEqual(new BadRequestException('Token does not match'));
      }
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith("112233");
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.clearAllMocks();
      const data = {
        email: userData.email,
        oldPassword: userData.password,
        newPassword: "Newpassword@1",
        token: 123456
      };
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(authData as auth);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      try{
        await service.changePassword(data);
      }
      catch(error)
      {
        expect(error).toEqual(new NotFoundException(`User not found for email: ${data.email}`));
      }
    });

    it('should throw BadRequestException if password does not matches', async () => {
      jest.clearAllMocks();
      const data = {
        email: userData.email,
        oldPassword: userData.password,
        newPassword: "Newpassword@1",
        token: 123456
      };
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(authData as auth);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(userData);
      jest.spyOn(bcrypt, 'comparePassword').mockResolvedValue(true);
      try{
        await service.changePassword(data);
      }
      catch(error)
      {
        expect(error).toEqual(new BadRequestException('Incorrect password.'));
      }
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: data.email
        }
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith("123456");
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: userData.email,
          isEmailVerified: userData.isEmailVerified,
          isActive: userData.isActive
        }
      });
      expect(bcrypt.comparePassword).toHaveBeenCalledWith(data.oldPassword, 'hashedPassword');
    });
  });
});
