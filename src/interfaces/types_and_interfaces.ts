import { ObjectId } from "mongoose";

type Role = "admin" | "user";
type Currency = "INR" | "USD" | "EUR" | "CAD" | "AUD" | "GBP" | "JPY" | "SGD" | "RUB" | "THB";

interface IUser {
    username: string;
    email: string;
    password: string;
    role: Role;
    isActive: boolean;
    last_login?: Date;
}

type TransactionType = "incoming" | "outgoing" 
type TransactionMode = "UPI" | "Net Banking" | "Cash" | "Crypto" | "Other";

interface ITransaction {
    userId: ObjectId,
    description?: string,
    type: TransactionType,
    amount: Number,
    category: string,
    transaction_date: Date,
    mode?: TransactionMode,
    reciever?: string,
}

interface IServiceResponse {
    response: Object | string | Array<any> | null, 
    responseCode: number,
    error: string | null | Error
}

export {
    Role,
    IUser,
    ITransaction,
    IServiceResponse
}