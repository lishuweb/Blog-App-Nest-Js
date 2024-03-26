import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
    async bcryptPassword(password: string) 
    {
        return bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
    };

    async comparePassword(password: string, passwordHash: string) 
    {
        return bcrypt.compare(password, passwordHash);
    }
};