import { UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

export const generateJWT = (userData: any) => {
    if(!process.env.ACCESS_TOKEN_SECRET)
    {
        throw new Error ("Access Token Secret is not defined.");
    }
    const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET);
    return accessToken;
};

export const generateRefreshToken = (userData: any) => {
    if(!process.env.REFRESH_TOKEN_SECRET)
    {
        throw new UnauthorizedException ("Refresh Token Secret not provided!");
    }
    const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET);
    return refreshToken;
};

export const verifyJWT = (token: string) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) as JwtPayload;
};