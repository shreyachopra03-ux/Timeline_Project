import User from "../models/user";
import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

export const registerUser = async (req: Request, res: Response) => {

    try {
        const errors = validationResult(req);
        // console.log(errors);
        if(!errors.isEmpty()) {
            res.status(400).json({ error: errors.array()[0].msg });
            return;
        }

    const { name, email, password, avatar } = req.body;

    const existingUser = await User.findOne({ email });
    if(existingUser) {
        res.status(400).json({ message: "Email already registered" });
        return;
    }
    // Hash the password before saving it into the DB
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    // Create a new instance of the User model
    const user = new User({
        name,
        email,
        password: hashedPassword,
        avatar
    });

    await user.save();
    res.status(200).json({ 
        data: { name, email },
        message: "User registered successfully!" 
    });
    } 
    catch (err: any) {
        res.status(500).json({ message: "Server error", err})
    }
};
