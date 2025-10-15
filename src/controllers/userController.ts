import userServices from "../services/userServices";
import { Request, Response, NextFunction } from "express";
import { IServiceResponse } from "../interfaces/types_and_interfaces";
import { DatabaseError, InternalServerError, NotFoundError } from "../errors";
import logger from "../utils/logger";
import { userSchema } from "../utils/schemas";
import { ZodError } from "zod";

export const getUserController = async(req: Request, res: Response, next: NextFunction) => {
    const userId: string = req.params.id;
    let serviceResponse: IServiceResponse;
    try {
        if(!userId || userId === "") {
            serviceResponse = await userServices.fetchUser(true, {});
        } else {
            serviceResponse = await userServices.fetchUser(false, {_id: userId});
        }

        return res.status(200).json({message: "success", response: serviceResponse.response})
    } catch(error: any) {
        if(error.message = "User not found") {
            next(new NotFoundError())
        } else {
            next(new DatabaseError(error.message))
        }
    }

}

export const createUserController = async(req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;
    try {
        userSchema.parse({username, email, password})
    } catch(error) {
        if(error instanceof ZodError) {
            logger.error(`Zod Error: Validation failed - ${error.issues}`)
            next(new InternalServerError("Request Body validation failed."))
            return res.status(200).json({"message": "failure", error: error.issues})
        }
    }
    try {
        const serviceResponse: IServiceResponse = await userServices.createUser(username, email, password);
        return res.status(200).json({message: "success", data: serviceResponse.response})
    } catch(error) {
        logger.error(`Database Error while creating user: ${error}`);
        next(new DatabaseError(String(error)))
    }
}

export const deleteUserController = async(req: Request, res: Response, next: NextFunction) => {
    const id: string = req.params.id;
    try {
        const serviceResponse: IServiceResponse = await userServices.deleteUser(id);
        return res.status(200).json({message: "success", data: serviceResponse.response});
    } catch(error) {
        logger.error(`Database Error while deleting user: ${error}`);
        next(new DatabaseError(String(error)));
    }
}