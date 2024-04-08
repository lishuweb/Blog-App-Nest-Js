import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mail } from '../../utils/mail';
import { generateOTP, verifyOTP } from '../../utils/otp';
import { BcryptService } from '../../utils/bcrypt';
import { ChangePasswordDto, ChangePasswordTokenDto, ForgotPasswordDto, LoginAuthDto } from './dto/create-auth.dto';
import { generateJWT, generateRefreshToken } from '../../utils/jwt';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private bcrypt: BcryptService  
  ) {}

  async getAuth() {
    try{
      return await this.prisma.auth.findMany({});
    }
    catch(error)
    {
      throw new Error (error);
    }
  }

  async create(payload: any) 
  {
    const passwordHash = await this.bcrypt.bcryptPassword(payload.password);
    const newUser = {
      ...payload, password: passwordHash
    };

    await this.prisma.user.create({
      data: newUser
    });

    const token = generateOTP();
    const authUser = {
      email: payload.email,
      token: Number(token)
    };

    await this.prisma.auth.create({
      data: authUser
    });

    await mail(payload.email, +token);
    return newUser;
  }

  async verifyUser(payload: any) 
  {
    const foundUser = await this.prisma.auth.findUnique({
      where: {
        email: payload.email
      }
    });
    console.log(foundUser, "foudUser");
    if(!foundUser)
    {
      throw new Error ("Auth User Not Found, Do Register First");
    }
    const validToken = await verifyOTP(payload.token);
    console.log(validToken, "validToken");
    console.log(foundUser.token);
    console.log(payload.token);
    if(!validToken)
    {
      throw new Error ("Token in valid!");
    }
    const matchToken = String(foundUser.token) === payload.token;
    
    console.log(matchToken, "MatchToken")
    console.log(typeof (foundUser.token));
    console.log(typeof (payload.token));
    if(!matchToken)
    {
      throw new Error ("Token is mismatched!");
    }
    await this.prisma.user.update({
      where: {
        email: payload.email
      },
      data: {
        isEmailVerified: true,
        isActive: true
      }
    });
    await this.prisma.auth.delete({
      where: {
        email: payload.email
      }
    });
    return 'Account Verification Successful!';
  }

  async login(payload: LoginAuthDto) 
  {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        email: payload.email
      }
    });
    console.log(foundUser, "foundUser");
    if(!foundUser)
    {
      throw new Error("User not Found!");
    }
    if(!foundUser.isEmailVerified && !foundUser.isActive)
    {
      throw new Error ("Email is not verified and is not active!");
    }
    const passwordCheck = await this.bcrypt.comparePassword(payload.password, foundUser.password);
    console.log(passwordCheck, "passwordCheck");
    if(passwordCheck)
    {
      const userForToken = {
        email: foundUser.email,
        id: foundUser.id,
        name: foundUser.name
      };

      const accessToken = await generateJWT(userForToken);
      const refreshToken = await generateRefreshToken(userForToken);
      // return accessToken;
      return {
        userForToken,
        accessToken,
        refreshToken
      };
    }
    else 
    {
      throw new Error("Password did not matched!");
    }
  }

  async forgotPasswordToken(email: string)
  {
    const isUser = await this.prisma.user.findUnique({
      where: {
        email,
        isEmailVerified: true,
        isActive: true
      }
    });
    console.log(isUser, "user forgot password");
    if(!isUser)
    {
      throw new NotFoundException(`User not found for email: ${email}`);
    }
    const token = generateOTP();
    await this.prisma.auth.create({
      data: {
        email: isUser.email,
        token: Number(token)
      } 
    });
    await mail(email, +token);
    return true;
  }

  async forgotPassword(payload: ForgotPasswordDto)
  {
    const checkUser = await this.prisma.auth.findUnique({
      where: {
        email: payload.email
      }
    });
    if(!checkUser)
    {
      throw new NotFoundException(`User not found for email: ${payload.email}`);
    }
    const isToken = await verifyOTP(String(payload.token));
    if(!isToken)
    {
      throw new Error("Invalid OTP Token!");
    }
    const isMatch = checkUser.token === payload.token;
    if(!isMatch)
    {
      throw new Error("OTP Token Mismatched!");
    }
    const passwordHash = await this.bcrypt.bcryptPassword(payload.password);
    await this.prisma.user.update({
      where: {
        email: checkUser.email
      },
      data: {
        password: passwordHash
      }
    });
    await this.prisma.auth.delete({
      where: {
        email: checkUser.email
      }
    });
    return true;
  }

  async changePasswordToken(payload: ChangePasswordTokenDto)
  {
    const checkUser = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
        isEmailVerified: true,
        isActive: true
      }
    });
    if(!checkUser)
    {
      throw new NotFoundException(`User not found for email: ${payload.email}`);
    }
    const token = generateOTP();
    await this.prisma.auth.create({
      data: {
        email: checkUser.email,
        token: Number(token)
      }
    });
    await mail(checkUser.email, +token);
    return true;
  }

  async changePassword(payload: ChangePasswordDto) 
  {
    console.log(payload, "payload")
    const checkUser = await this.prisma.auth.findUnique({
      where: {
        email: payload.email
      }
    });
    console.log(checkUser, "checkUser");
    if(!checkUser)
    {
      throw new NotFoundException(`User not found for email: ${payload.email}`);
    }
    console.log(typeof payload.token);
    console.log(typeof checkUser.token);
    const isValid = await verifyOTP(String(payload.token));
    console.log(isValid, 'isValid');
    if(!isValid)
    {
      throw new  BadRequestException('Invalid OTP');
    }
    const checkToken = checkUser.token === payload.token;
    console.log(checkToken, "checkToken");
    if(!checkToken)
    {
      throw new BadRequestException('Token does not match');
    }
    const registerUser = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
        isEmailVerified: true,
        isActive: true
      }
    });
    console.log(registerUser, "registerUser");
    if(!registerUser)
    {
      throw new NotFoundException(`User not found for email: ${payload.email}`);
    }
    const checkPassword = await this.bcrypt.comparePassword(payload.oldPassword, registerUser.password);
    if(!checkPassword)
    {
      throw new BadRequestException('Incorrect password.');
    }
    const passwordHash = await this.bcrypt.bcryptPassword(payload.newPassword);
    await this.prisma.user.update({
      where: {
        email: payload.email
      },
      data: {
        password: passwordHash
      }
    });
    await this.prisma.auth.delete({
      where: {
        email: payload.email
      }
    });
    return true;
  }

}
