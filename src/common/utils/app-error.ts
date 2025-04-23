export enum CommonError {
  DB_ERROR = 'DB_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
}
export enum CommonErrorStatusCode {
  INTERNAL_SERVER_ERROR = 500,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
}

export class AppError extends Error {
  public readonly name: string;
  public readonly errorType: CommonError;
  public readonly httpStatusCode: number;
  public readonly cause?: Error;

  constructor(
    errorType: CommonError,
    message: string,
    options?: { httpStatusCode: CommonErrorStatusCode; cause?: Error },
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // instanceof 작동을 위해 필요
    this.name = this.constructor.name;
    this.errorType = errorType;
    this.httpStatusCode =
      options?.httpStatusCode || CommonErrorStatusCode.INTERNAL_SERVER_ERROR;
    this.cause = options?.cause;
    Error.captureStackTrace(this);
  }
}
