import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/types_and_interfaces";

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    role: { type: String, enum: ["admin", "user"] , required: true },
    isActive: { type: Boolean, required: true },
    last_login: { type: Date, required: false },
    authProvider: { type: String, required: false },
    picture: { type: String, required: false },
    authId: { type: String, require: false }
}, { timestamps: true })

const UserModel = model<IUser>("User", userSchema);

export default UserModel;