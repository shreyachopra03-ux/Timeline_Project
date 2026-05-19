import express from "express";
const authRouter = express.Router();
import { body } from "express-validator";
import { registerUser } from "../controllers/authController";

authRouter.post("/registerUser", 
        [
        body("name", "Name is required").notEmpty().trim(),
        body("email", "PLease enter a valid email").isEmail().trim(),
        body("password", "Password must be atleast 6 characters long").isLength({ min: 6 })
        ],
registerUser
);

export default authRouter;