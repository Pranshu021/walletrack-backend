import { connectMongoDB } from "../config/mongo";
import { DatabaseError } from "../errors";
import UserModel from "../models/userModel";
import logger from "../utils/logger";
import * as bcrypt from 'bcrypt';

const fetchUser = async(all: boolean = false, searchParams: object) => {
    try {
        let user;
        if(all) {
            user = await UserModel.find();
        } else {
            user = await UserModel.findOne(searchParams);
        }
        if(!user) {
            const err = new Error("User not found");
            throw err;
        }
        return {
            response: user,
            responseCode: 0,
            error: null
        }
    } catch(error) {
        throw error;
    }
}

const createUser = async(username: string, email: string, password: string) => {
    try {
        const existingUser = await UserModel.findOne({email});
        if(existingUser) {
            const err = new Error(`DuplicateUserError: User already exists with this email`);
            throw err;
        }
        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new UserModel({
            username: username,
            email: email,
            password: hashedPassword,
            role: 'user',
            isActive: true,
            last_login: null
        });
    
        const savedUser = await newUser.save();
        return  {
            response: savedUser,
            responseCode: 0,
            error: null
        }
    } catch(error) {
        throw error;
    }    
};

const deleteUser = async(id: string) => {
    try {
        const existingUser = await UserModel.findOne({_id: id});
        if(!existingUser) {
            const err = new Error("User does not exist");
            throw err
        }

        const deletedUser = await UserModel.deleteOne({_id: id});
        return {
            response: deletedUser,
            responseCode: 0,
            error: null
        }
    } catch(error) {
        throw error;
    }
}

const userServices = {
    fetchUser,
    createUser,
    deleteUser
}

export default userServices;