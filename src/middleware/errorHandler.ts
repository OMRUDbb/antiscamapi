import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    details?: unknown;
  };
}

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    const body: ErrorResponse = {
      success: false,
      error: {
        message: error.message,
        ...(error.details !== undefined && { details: error.details }),
      },
    };
    res.status(error.statusCode).json(body);
    return;
  }

  console.error("Unhandled error:", error);

  const body: ErrorResponse = {
    success: false,
    error: {
      message: "An unexpected error occurred",
    },
  };
  res.status(500).json(body);
};
