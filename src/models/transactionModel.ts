import mongoose, { Schema, model } from "mongoose";
import { ITransaction } from "../interfaces/types_and_interfaces";

const transactionSchema = new Schema<ITransaction>({
    userId: { type: String, required: true },
    description: { type: String, required: false },
    type: { type: String, required: true },
    amount: { type: Schema.Types.Decimal128, required: true,
        get: (amount: mongoose.Types.Decimal128) => parseFloat(amount.toString()),
        set: (amount: number) => mongoose.Types.Decimal128.fromString(amount.toString())
    },
    category: { type: String, required: false },
    transaction_date: { type: Date, required: true },
    mode: { type: String, required: false },
    receiver: { type: String, required: false }
}, { toJSON: {getters: true}, toObject: {getters: true} });

transactionSchema.index({ userId: 1 });

const TransactionModel = model("Transaction", transactionSchema);

export default TransactionModel;
