import * as z from "zod";

const transactionCategories = ["Food & Dining" , "Bills & Utilities" , "Transportation & Travel" , "Shopping" , "Entertainment & Leisure" , "Health & Fitness" , "Education" , "Business Expense" , "Personal Care" , "Gifts & Donations" , "Investment" , "Income" , "Miscellaneous / Others"]
const transactionType = ["incoming", "outgoing"]
const transactionMode = ["UPI", "Net Banking", "Cash", "Crypto", "Other"]

export const userSchema = z.object({
    username: z.coerce.string(),
    email: z.email(),
    password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character (@, $, !, %, *, ?, &)" }),
})

export const transactionSchema = z.object({
    userId: z.coerce.string(),
    description: z.coerce.string().max(200, { message: "Description must be below 200 characters" }),
    amount: z.coerce.number().gt(0, { message: "Amount should be greater than 0" }),
    category: z.coerce.string().refine((val) => transactionCategories.includes(val),{ message: "Invalid category type" }),
    type: z.coerce.string().refine((val) => transactionType.includes(val), { message: "Invalid transaction type" }),
    transaction_date: z.coerce.date(),
    mode: z.coerce.string().refine((val) => transactionMode.includes(val), { message: "Invalid transaction mode" }),
    receiver: z.coerce.string(),
})