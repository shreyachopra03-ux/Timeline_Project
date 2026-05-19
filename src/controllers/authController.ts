import User from "../models/user";
import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

export const registerUser = async (req: Request, res: Response) => {

    try {
        const errors = validationResult(req);
        console.log(errors);
        if(!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if(existingUser) {
        res.status(400).json({ message: "Email already registered" });
        return;
    }

    res.status(200).json({
        data: { name, email },
        message: "Success"
    });

    const hashedPassword = await bcrypt.hash(password, 10);


    } 
    catch (err: any) {
        res.status(500).json({ message: "Server error", err})
    }
};
