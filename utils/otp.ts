import { totp } from "otplib";
import * as dotenv from 'dotenv';

totp.options = {
    digits: 6,
    step: Number(process.env.OTP_DURATION)
};
dotenv.config();

export const generateOTP = () => {
    totp.options = {
        digits: 6,
        step: 300
    };
    return totp.generate(process.env.OTP_SECRET);
};

export const verifyOTP = async (token: string) => {
    totp.options = {
        digits: 6,
        step: 300
    };
    const isValid = totp.check(token, process.env.OTP_SECRET);
    return isValid;
};

