import { Injectable, NestMiddleware } from "@nestjs/common";
import { generateJWT, verifyJWT, verifyRefreshToken } from "../../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

@Injectable()
export class tokenExtractorMiddleware implements NestMiddleware
{
    async use(req: any, res: any, next: (error?: any) => void) 
    {
        if(!req.headers.authorization)
        {
            throw new Error ("Token is not provided");
        }
        const accessToken = req.headers.authorization.split(' ')[1];
        console.log(accessToken, "AccessToken");

        const refreshToken = req.headers["x-authorization"];
        console.log(refreshToken, "RefreshToken");

        const isValid = await verifyJWT(accessToken) as JwtPayload;
        console.log(isValid, "isValidAccessToken");

        if(isValid)
        {
            // (req as any).userId = isValid.id;
            req.body.userId = isValid.id;
            console.log(isValid.id, "isValidId");
            (req as any).userName = isValid.name;
            next();
        } 
        // next(); 
        else 
        {
            const decodedToken = verifyRefreshToken(refreshToken);
            console.log(decodedToken, "decodedToken");
            if(decodedToken)
            {
                const userData = {
                    id: decodedToken.id,
                    email: decodedToken.email
                };

                const newAccessToken = generateJWT(userData);
                res.setHeader("x-access-token", newAccessToken);
                req.body.userId = decodedToken.id;
            }
            if(!decodedToken)
            {
                throw new Error ("Token Expired, Please Login!");
            }
            next();
        }
    }
}