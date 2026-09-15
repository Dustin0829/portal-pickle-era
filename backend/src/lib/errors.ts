export type ErrorDetails = unknown;

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string | undefined;
  readonly errors: ErrorDetails | undefined;

  constructor(message: string, statusCode: number, code?: string, errors?: ErrorDetails) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors?: ErrorDetails) {
    super(message, 422, "VALIDATION_ERROR", errors);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409, "CONFLICT");
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", code?: string) {
    super(message, 503, code);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
