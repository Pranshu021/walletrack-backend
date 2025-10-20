import { transactionServices } from "../services/transactionServices";
import logger from "../utils/logger";
import { InternalServerError, DatabaseError } from "../errors";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { transactionSchema } from "../utils/schemas";
import { IServiceResponse } from "../interfaces/types_and_interfaces";


export const fetchTransactionController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            userId,
            first=10,
            receiver,
            after,
            search,
            sortBy,
            sortOrder,
            category,
            type,
            mode,
            startDate,
            endDate
        } = req.query;

        if(!userId) {
            return res.status(500).json({message: "failure", error: "Invalid query params"})
        }

        const transactions = await transactionServices.fetchAllTransactionsForUser({
            userId: userId as string,
            first: first as Number,
            after: after as string,
            search: search as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as "asc" | "desc",
            category: category as string,
            type: type as string,
            mode: mode as string,
            startDate: startDate as string,
            endDate: endDate as string
        })

        if(transactions.response && transactions.statusCode === 0 && !transactions.error) {
            return res.status(200).json({message: "success", data: transactions.response})
        }

    } catch(error) {
        logger.error(`❌ Error in Fetching transactions: ${error}`);
        next(error);
    }
    
}

export const createTransactionController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, description, amount, type, category, transaction_date, mode, receiver } = req.body;
        try {
            transactionSchema.parse({description, amount, type, category, transaction_date, mode, receiver})
        } catch(error) {
            if(error instanceof ZodError) {
                logger.error(`❌ Zod Error: Validation failed - ${error.issues}`)
                next(new InternalServerError("Request Body validation failed."))
                return res.status(500).json({"message": "failure", error: error.issues})
            }
        }

        const createTransactionServiceResponse: IServiceResponse = await transactionServices.createTransaction({
            userId,
            description,
            amount,
            type,
            category,
            transaction_date,
            mode, 
            receiver
        })

        if(createTransactionServiceResponse.response && createTransactionServiceResponse.responseCode === 0) {
            return res.status(200).json({ message: "success", data: createTransactionServiceResponse.response })
        }
        
    } catch(error) {
        logger.error(`❌ Error in CreateTransaction controller - ${error}`);
        next(error);
    }

}