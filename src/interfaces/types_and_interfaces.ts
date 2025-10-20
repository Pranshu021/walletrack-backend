import { ObjectId } from "mongoose";

type Role = "admin" | "user";
type Currency = "INR" | "USD" | "EUR" | "CAD" | "AUD" | "GBP" | "JPY" | "SGD" | "RUB" | "THB";

export interface IUser {
    username: string;
    email: string;
    password?: string;
    role: Role;
    isActive: boolean;
    last_login?: Date;
    authProvider?: String;
    picture?: String;
    authId?: String;
    currency? : Currency;
}

type TransactionType = "incoming" | "outgoing" 
type TransactionMode = "UPI" | "Net Banking" | "Cash" | "Crypto" | "Other";
export type TransactionCategory = "Food & Dining" | "Bills & Utilities" | "Transportation & Travel" | "Shopping" | "Entertainment & Leisure" | "Health & Fitness" | "Education" | "Business Expense" | "Personal Care" | "Gifts & Donations" | "Investment" | "Income" | "Miscellaneous / Others";

export interface ITransaction {
    userId: ObjectId,
    description?: string,
    type: TransactionType,
    amount: Number,
    category: TransactionCategory,
    transaction_date: Date,
    mode?: TransactionMode,
    receiver?: string,
}

export interface IFetchTransactionParams {
    userId: string;
    first: Number;
    after?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    category?: string;
    type?: string;
    mode?: string;
    startDate?: string;
    endDate?: string;
  }

export interface IServiceResponse {
    response: Object | string | Array<any> | null, 
    responseCode: number,
    error: string | null | Error
}
