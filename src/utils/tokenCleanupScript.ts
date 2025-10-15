import sessionTokensModel from "../models/sessionTokensModel";

export async function cleanExpiredRefreshTokens() {
  await sessionTokensModel.deleteMany({ expires: { $lt: new Date() } });
}