import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomError";
import logger from "../utils/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  if (err instanceof CustomError) {
    logger.error(`[${req.method}] ${req.url} -> ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  logger.error(`[${req.method}] ${req.url} -> ${err.stack || err.message}`);

  // fallback for unknown errors
  res.status(500).json({
    success: false,
    error: "Something went wrong",
  });
}
