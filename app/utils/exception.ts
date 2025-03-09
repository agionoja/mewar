import { HttpStatus } from "~/utils/status";
import type { BaseModel } from "~/models/base.model";

// Constrain T to objects with string keys
export class Exception<T extends BaseModel = any> extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public field?: keyof T & string, // Ensure field is a string key of T
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// UnauthorizedException
export class UnauthorizedException<
  T extends BaseModel = any,
> extends Exception<T> {
  constructor(message: string, field?: keyof T & string) {
    super(HttpStatus.UNAUTHORIZED, message, field);
  }
}

// NotFoundException
export class NotFoundException<T extends BaseModel> extends Exception<T> {
  constructor(message = "Not found", field?: keyof T & string) {
    super(HttpStatus.NOT_FOUND, message, field);
  }
}

// ForbiddenException
export class ForbiddenException<T extends BaseModel> extends Exception<T> {
  constructor(message = "Forbidden", field?: keyof T & string) {
    super(HttpStatus.FORBIDDEN, message, field);
  }
}

export class ConflictException<T extends BaseModel> extends Exception<T> {
  constructor(message = "Conflict", field?: keyof T & string) {
    super(HttpStatus.CONFLICT, message, field);
  }
}
