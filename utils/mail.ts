// import nodemailer from "nodemailer";
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
    },
});

export const mail = async (email: string, otpToken: number) => {
    await transporter.sendMail({
        from: process.env.GMAIL_EMAIL,
        to: email,
        subject: "OTP Verification",
        text: "Hello world",
        html: `<div> Hi! Your OTP Code is <b>${otpToken}</b></div>`
    });
    return true;
}