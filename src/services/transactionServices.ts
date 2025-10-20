import { ITransaction, IFetchTransactionParams } from "../interfaces/types_and_interfaces";
import TransactionModel from "../models/transactionModel";
import UserModel from "../models/userModel";
import logger from "../utils/logger";

const fetchAllTransactionsForUser = async(params: IFetchTransactionParams) => {
    try {
        const { userId, search, sortBy, sortOrder, category, type, mode, startDate, endDate } = params;

        let query: any = { userId };
        if (category) query.category = category;
        if (type) query.type = type;
        if (mode) query.mode = mode;
        if (startDate || endDate) {
            query.transaction_date = {};
            if (startDate) query.transaction_date.$gte = new Date(startDate);
            if (endDate) query.transaction_date.$gte = new Date(endDate);
        }

        if(search) {
            query.$or = [
                { description: { $regex: search, $options: "i" } },
                { receiver: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ]
        }

        const sortOptions: any = {}
        if(sortBy) {
            sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
        } else {
            sortOptions.transaction_date = -1
        }

        const user = await UserModel.findOne({ _id: userId }) 
        if(!user) {
            const err = new Error("User not found");
            throw err;
        }

        logger.info(`📦 Fetching transactions for user ${userId} with filters: ${JSON.stringify(query)}`);

        const transactions = await TransactionModel.find(query).sort(sortOptions);

        logger.info(`✅ Fetched ${transactions.length} transactions for user ${userId}`);

        return {
            response: transactions,
            error: null,
            statusCode: 0
        }
        
    } catch(error) {
        throw error;
    }
}

const createTransaction = async(params: ITransaction) => {
    try {
        const user = UserModel.findOne({ _id: params.userId });
        if(!user) {
            const error = new Error("No user found");
            throw error;
        }

        const newTransaction = await TransactionModel.create({
            userId: params.userId,
            amount: params.amount,
            type: params.type,
            transaction_date: params.transaction_date,
            description: params.description,
            category: params.category,
            mode: params.mode,
            receiver: params.receiver,
        })

        return {
            response: newTransaction,
            responseCode: 0,
            error: null
        }
    } catch(error) {
        throw error;
    }
}


export const transactionServices = {
    fetchAllTransactionsForUser,
    createTransaction
}

