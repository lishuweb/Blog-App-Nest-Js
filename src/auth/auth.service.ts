import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { mail } from 'utils/mail';
import { generateOTP, verifyOTP } from 'utils/otp';
import { BcryptService } from 'utils/bcrypt';
import { LoginAuthDto } from './dto/create-auth.dto';
import { generateJWT } from 'utils/jwt';

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

  async create(payload: any) {
    // const {
    //   name,
    //   email,
    //   image,
    //   isEmailVerified,
    //   isActive,
    //   isArchive,
    //   createdBy,
    //   updatedBy
    // } = payload;

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
      throw new Error("User  not Found!");
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
      return accessToken;
    }
  }

}
