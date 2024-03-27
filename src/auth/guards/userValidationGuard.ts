import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { verifyJWT } from "utils/jwt";
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class userValidationMiddleware implements NestMiddleware {
    constructor (private prisma: PrismaService) {}

    // async isValidUser(inputRole: string[], userRole: string)
    // {
    //     return inputRole.includes(userRole);
    // }

    async use(req: any, res: any, next: (error?: any) => void) 
    {
    
            const token = req.headers.authorization?.split(' ')[1];
            console.log(token, "token");
            if(!token)
            {
                throw new HttpException('Token is missing!', HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const decodedToken = await verifyJWT(token) as JwtPayload;
            console.log(decodedToken, "decodedToken");
            const { userEmail } = decodedToken;
            console.log(userEmail, "userEmail");
            const userData =  await this.prisma.user.findUnique({
                where: {
                    email: userEmail
                }
            });
            console.log(userData, "userData");
            if(!userData)
            {
                throw new HttpException("User does not exist", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            // (req as any).userId = userData.id;
            // (req as any).userRole = userData.roles;
            // req.user = {
            //     id: (await userData).id,
            //     roles: (await userData).roles
            // }
            // console.log(req.user, "reqUser");

            (req as any).userId = userData.id;
            (req as any).userRoles = userData.roles;

            const inputRole = ["ADMIN", "USER"];

            // const checkRole = this.isValidUser(roles, userData.roles);
            const checkRole = inputRole.includes((await userData).roles);
            if(!checkRole)
            {
                throw new HttpException("Role is invalid", HttpStatus.FORBIDDEN);
            }
            next();
        
    // }    
    }
};