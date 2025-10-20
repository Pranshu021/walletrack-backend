import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { ValidationError, AuthenticationError, DatabaseError } from "../errors";
import UserModel from "../models/userModel";
import userServices from "../services/userServices";
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import sessionTokensModel, { IRefreshToken } from "../models/sessionTokensModel";
import { OAuth2Client } from "google-auth-library";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";
import dotenv from "dotenv"

dotenv.config();

const REFRESH_TOKEN_COOKIE = "token"; // cookie name

export const login = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;
        if(!username || !email || !password) return next(new ValidationError("Username, Email and Passowrd required"));
        
        const user = await UserModel.findOne({ username });
        
        if(!user) return next(new ValidationError("Invalid Credentials"))
        
        const matchPassword = await bcrypt.compare(password, user.password || "");
        if(!matchPassword) return next(new ValidationError("Invalid Credentials"))

        const accessToken = signAccessToken({userId: user._id.toString(), role: user.role});
        const refreshToken = signRefreshToken({ userId: user._id.toString() });

        const expires = new Date();
        expires.setDate(expires.getDate() + 30);

        const sessionTokenDoc = sessionTokensModel.create({
            token: refreshToken,
            user: user._id,
            expires,
            createdByIp: req.ip
        })

        res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // use "strict" if no cross-site usage; "lax" is a common middle-ground
            domain: process.env.COOKIE_DOMAIN,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days in ms
        });

        res.json({ success: true, accessToken })
    } catch(error) {
        logger.error("❌ Login error: ", error);
        next(new DatabaseError("Login Failed"));
    }
}

export const refreshToken = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies || req.cookies[REFRESH_TOKEN_COOKIE];
        if(!token) return next(new ValidationError("Token missing"));

        let payload: any;
        try {
            payload = verifyRefreshToken(token.toString());
        } catch(error) {
            res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
            return next(new ValidationError("Invalid refresh token"))
        }

        const stored = await sessionTokensModel.findOne({ token }).populate("user").exec() as IRefreshToken | null;
        if(!stored) {
            res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
            return next(new ValidationError("Refresh token not recognized"));
        }

        if(!stored.isActive()) {
            res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
            return next(new ValidationError("Refresh token expired or revoked"));
        }

        const newRefreshToken = signRefreshToken({ userId: stored.user._id.toString() });
        const expires = new Date();

        expires.setDate(expires.getDate() + 30);
        stored.revoked = new Date();
        stored.revokedByIp = req.ip || "";
        stored.replacedByToken = newRefreshToken;
        await stored.save();

        await sessionTokensModel.create({
            token: newRefreshToken,
            user: stored.user._id.toString(),
            expires,
            createdByIp: req.ip
        })

        const accessToken = signAccessToken({ userId: stored.user._id.toString(), role: stored.user.role })
        res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            domain: process.env.COOKIE_DOMAIN,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 30
          });
      
        res.status(201).json({ success: true, accessToken });
    } catch(error) {
        logger.error("❌ Refresh error: " + (error as Error).message);
        next(error);
    }
}

export const logout = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies || req.cookies[REFRESH_TOKEN_COOKIE];
        if(!token) return res.status(204).send();
        
        const stored = await sessionTokensModel.findOne({ token });
        if(stored && stored.isActive()) {
            stored.revoked = new Date();
            stored.revokedByIp = req.ip || null;
            await stored.save();
        }
        res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
        res.json({ message: "success", data: "Logged Out" });
    } catch(error) {
        logger.error("❌ Logout error: ", (error as Error).message);
        return next(error);
    }
}


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleLoginController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_token } = req.body;
        if(!id_token) return res.status(401).json({ error: "Missing Token" });

        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if(!payload) return res.status(400).json({ error: "Invalid token" });

        const { email, name, picture, sub: googleId } = payload;
        
        console.log("Payload: ", payload)
        let user; 
        user = await UserModel.findOne({ email });
        if(!user) {
            user = await UserModel.create({
                username: name,
                email: email,
                role: 'user',
                isActive: true,
                authProvider: 'google',
                picture: picture,
                authId: googleId,
                currency: "INR"
            });
        }

        const accessToken = signAccessToken({userId: user._id, role: user.role});
        const refreshToken = signRefreshToken({userId: user._id})

        const expires = new Date();
        expires.setDate(expires.getDate() + 30);

        await sessionTokensModel.create({
            token: refreshToken,
            user: user._id,
            expires,
            createdByIp: req.ip
        })
        
        res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            domain: process.env.COOKIE_DOMAIN,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 30
          });

        res.status(201).json({success: "true", accessToken: accessToken, user: {
            name: user.username,
            email: user.email,
            profileImage: user.picture
          }})

    } catch(error) {
        logger.error("❌ Login error: ", (error as Error).message);
        return next(error);
    }
}
