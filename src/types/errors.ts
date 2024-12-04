export const ErrorCode = {
  SDK_ERROR: 'SDK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  INVALID_CONFIG: 'INVALID_CONFIG'
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

export class BaseError extends Error {
  constructor(
    public code: ErrorCodeType,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'BaseError';
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  toString(): string {
    return `[${this.code}] ${this.message}${this.details ? `: ${this.details}` : ''}`;
  }
} 