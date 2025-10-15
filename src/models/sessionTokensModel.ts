import { Schema, model, Document } from 'mongoose';

export interface IRefreshToken extends Document {
    token: string,
    user: any,
    expires: Date,
    createdAt: Date,
    createdByIp: string,
    revoked?: Date | null,
    revokedByIp: string | null,
    replacedByToken?: string | null,
    isActive: () => boolean;      
}

const refreshTokenSchema = new Schema<IRefreshToken>({
    token: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    createdByIp: { type: String },
    revoked: { type: Date, default: null },
    revokedByIp: { type: String, default: null },
    replacedByToken: { type: String, default: null },
});

refreshTokenSchema.methods.isActive = function() {
    return !this.revoked && new Date() < this.expires;
};

export default model<IRefreshToken>("RefreshToken", refreshTokenSchema, "session_tokens");