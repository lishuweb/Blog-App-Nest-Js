import * as jwt from "jsonwebtoken";

export const generateJWT = (userData: any) => {
    if(!process.env.ACCESS_TOKEN_SECRET)
    {
        throw new Error ("Access Token Secret is not defined.");
    }
    const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET);
    return accessToken;
};

export const verifyJWT = (token: string) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}