import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createError } from "../utils/error.js";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from "../constant/HttpStatus.js";
import dotenv from 'dotenv';
import AccountSchema from "../models/AccountSchema.js";

dotenv.config();

export const registerAdmin = async (req, res, next) => {
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)
        const newAdmin = new AccountSchema({
            ...req.body,
            name: req.body.name.trim(),
            password: hash,
        })
        await newAdmin.save()
        res.status(CREATED).json({
            success: true,
            status: CREATED,
            message: newAdmin,
        });
    } catch (err) {
        next(err)
    }
};

export const loginAdmin = async (req, res, next) => {
    try {
        const admin = await AccountSchema.findOne({ name: req.body.name });
        if (!admin) return next(createError(NOT_FOUND, "Admin not found!"))
        const isPasswordCorrect = await bcrypt.compare(
            req.body.password,
            admin.password
        )
        if (!isPasswordCorrect) return next(createError(BAD_REQUEST, "Wrong password!"))
        const token_admin = jwt.sign(
            { name: admin.name },
            process.env.JWT_ADMIN,
            { expiresIn: "24h" },
        )
        const { password, ...otherDetails } = admin._doc;
        res.cookie("access_token_admin", token_admin, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        }).status(OK).json({ details: { ...otherDetails } })
    } catch (err) {
        next(err)
    }
};

export const logoutAdmin = (req, res, next) => {
    res.clearCookie("access_token_admin")
        .status(OK)
        .json("Admin has been successfully logged out.");
};