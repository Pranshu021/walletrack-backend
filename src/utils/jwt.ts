import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import logger from "./logger";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const RS256 = !!(process.env.JWT_PRIVATE_KEY_PATH && process.env.JWT_PUBLIC_KEY_PATH);
let privateKey: Buffer | null = null;
let publicKey: Buffer | null = null;

if(RS256) {
    try {
        privateKey = fs.readFileSync(path.resolve(process.env.JWT_PRIVATE_KEY_PATH as string));
        publicKey = fs.readFileSync(path.resolve(process.env.JWT_PUBLIC_KEY_PATH as string));
    } catch(error) {
        logger.error("Keys not available, falling back to secrets");
    }
}

const accessExpiryTime = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN || "900")
const refreshTokenExpiryTime = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || "30d")

export const signAccessToken = (payload: Object) => {
    const jwtOpts: jwt.SignOptions = {
        expiresIn: accessExpiryTime,
        jwtid: uuidv4()
    }

    if(RS256 && privateKey) return jwt.sign(payload, privateKey, {...jwtOpts, algorithm: "RS256"});
    const secret: string = process.env.JWT_ACCESS_TOKEN || "";
    return jwt.sign(payload, secret, {...jwtOpts, algorithm:"HS256"})
}

export const signRefreshToken = (payload: Object) => {
    const jwtOpts: jwt.SignOptions = {
        expiresIn: refreshTokenExpiryTime,
        jwtid: uuidv4()
    }
    if(RS256 && privateKey) return jwt.sign(payload, privateKey, {...jwtOpts, algorithm: "RS256"});
    const secret: string = process.env.JWT_REFRESH_TOKEN || "";
    return jwt.sign(payload, secret, {...jwtOpts, algorithm:"HS256"})
}

export const verifyAccessToken = (token: string) => {
    try {
        if(RS256 && publicKey) return jwt.verify(token, publicKey);
        return jwt.verify(token, process.env.JWT_ACCESS_TOKEN!);
    } catch(error) {
        throw error;
    }
}

export const verifyRefreshToken = (token: string) => {
    try {
        if(RS256 && publicKey) return jwt.verify(token, publicKey);
        return jwt.verify(token, process.env.JWT_REFRESH_TOKEN!);
    } catch(error) {
        throw error;
    }
}