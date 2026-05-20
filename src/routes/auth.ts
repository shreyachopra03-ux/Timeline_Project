import express from "express";
const authRouter = express.Router();
import { body } from "express-validator";
import { registerUser } from "../controllers/authController";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message:
        {
           error: "Too many attempts from this IP, please try again after 15 minutes."
        },
        standardHeaders: true,
        legacyHeaders: false,
});

authRouter.post("/registerUser", authLimiter,
     [
        body("name", "Name is required").notEmpty().trim(),
        body("email", "PLease enter a valid email").isEmail().trim(),
        body("password", "Password must contain an uppercase, lowercase, number and a special character")
         .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
     ],
registerUser
);


export default authRouter;