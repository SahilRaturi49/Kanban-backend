import nodemailer from "nodemailer";
import { asyncHandler } from "../utils/asynHandler.js"
import { ApiError } from "../utils/ApiError.js";

const transpoter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});



const sendOTPEmail = asyncHandler(async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subjet: "Your otp for Authentication",
        text: `Your OTP is: ${otp}`,
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    };

    await transpoter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    
})

export {sendOTPEmail}