import { Error as MongooseError } from "mongoose";
import jwt from "jsonwebtoken";
import { MongoServerError } from "mongodb";
import { ZodError } from "zod";
import { HttpStatus } from "~/utils/status";
import { Exception } from "~/utils/exception";
import { env } from "~/env.config";

export interface APIError {
  statusCode: number;
  message: string;
  error: string;
  field?: string;
  errors?: string[] | null;
  path: string;
  timestamp: string;
  stack?: string;
}

export interface APISuccess<
  TData,
  TMessage extends string | undefined = undefined,
> {
  data: TData;
  statusCode: number;
  message: TMessage;
}

export type APIResponse<
  TData,
  TMessage extends string | undefined = undefined,
> = APIError | APISuccess<TData, TMessage>;

export async function handleError<
  TData,
  TMessage extends string | undefined = undefined,
>(
  request: Request,
  callback: () => Promise<APISuccess<TData, TMessage>>,
): Promise<APIResponse<TData, TMessage>> {
  const path = request.url || "";
  const timestamp = new Date().toISOString();

  try {
    return await callback();
  } catch (error: unknown) {
    let apiError: APIError;

    if (error instanceof Exception) {
      apiError = {
        statusCode: error.statusCode,
        message: error.message,
        error: error.constructor.name,
        field: error.field,
        path,
        timestamp,
        errors: null,
        stack: error.stack,
      };
    } else if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      apiError = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Validation failed",
        error: "ValidationError",
        field: firstIssue?.path[0]?.toString(), // First field from Zod path
        errors: error.issues.map((issue) => issue.message),
        path,
        timestamp,
        stack: error.stack,
      };
    } else if (error instanceof MongoServerError) {
      switch (error.code) {
        case 11000: // Duplicate key error
          const keyValue = error.keyValue || {};
          const [key] = Object.keys(keyValue) || ["unknown"];
          apiError = {
            statusCode: HttpStatus.CONFLICT,
            message: `The ${key} is already in use. Please use a different ${key}.`,
            error: "DuplicateFieldError",
            field: key,
            path,
            timestamp,
            errors: null,
            stack: error.stack,
          };
          break;
        case 31254: // Invalid field projection
          apiError = {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message || "Invalid field projection",
            error: "ProjectionError",
            path,
            timestamp,
            errors: [error.message],
            stack: error.stack,
          };
          break;
        default:
          apiError = {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message || "Database error occurred",
            error: "DatabaseError",
            path,
            timestamp,
            errors: null,
            stack: error.stack,
          };
      }
    } else if (
      error instanceof MongooseError &&
      error.name === "ValidationError"
    ) {
      const validationError = error as MongooseError.ValidationError;
      const errors = Object.values(validationError.errors);
      const firstError = errors[0];
      apiError = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: firstError?.message || "Validation failed",
        error: "ValidationError",
        field: firstError?.path, // Field causing the validation error
        errors: errors.map((e) => e.message),
        path,
        timestamp,
        stack: error.stack,
      };
    } else if (error instanceof MongooseError && error.name === "CastError") {
      const castError = error as MongooseError.CastError;
      apiError = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid value for ${castError.path}: "${castError.value}"`,
        error: "CastError",
        field: castError.path,
        path,
        timestamp,
        errors: null,
        stack: error.stack,
      };
    } else if (error instanceof jwt.TokenExpiredError) {
      apiError = {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Your session has expired. Please log in again.",
        error: "TokenExpiredError",
        path,
        timestamp,
        errors: null,
        stack: error.stack,
      };
    } else if (error instanceof jwt.JsonWebTokenError) {
      apiError = {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Your token is invalid. Please log in again.",
        error: "JsonWebTokenError",
        path,
        timestamp,
        errors: null,
        stack: error.stack,
      };
    } else {
      const message =
        error instanceof Error ? error.message : "Internal server error";
      const stack = error instanceof Error ? error.stack : undefined;
      apiError = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: "InternalServerError",
        path,
        timestamp,
        errors: null,
        stack,
      };
    }

    if (env.NODE_ENV === "production") {
      delete apiError.stack;
    }

    return apiError;
  }
}
