/**
 * Error Handling Utilities
 * Provides consistent error handling and logging
 */

import { AppError } from '../types';

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RECORD_SAVE_ERROR: 'RECORD_SAVE_ERROR',
  SCHEMA_ERROR: 'SCHEMA_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  DATA_CORRUPTION: 'DATA_CORRUPTION',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export function createAppError(
  code: keyof typeof ERROR_CODES,
  message: string,
  context?: Record<string, any>
): AppError {
  const error = new Error(message) as AppError;
  error.code = ERROR_CODES[code];
  error.timestamp = new Date();
  error.context = context;
  return error;
}

export function logError(error: Error | AppError, severity: 'error' | 'warn' | 'info' = 'error'): void {
  const timestamp = new Date().toISOString();
  const isAppError = 'code' in error;
  
  console.log(`[${timestamp}] [${severity.toUpperCase()}]`, {
    message: error.message,
    code: isAppError ? error.code : 'UNKNOWN',
    context: isAppError ? error.context : undefined,
    stack: error.stack
  });
}

export function isSafeError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error;
}

export function handleError(
  error: unknown,
  defaultMessage: string = 'Nieznąd błąd'
): { message: string; code: string } {
  if (isSafeError(error)) {
    logError(error);
    return { message: error.message, code: error.code };
  } else if (error instanceof Error) {
    logError(error);
    return { message: error.message, code: ERROR_CODES.UNKNOWN_ERROR };
  } else {
    const message = String(error);
    console.error(`[${new Date().toISOString()}] [ERROR]`, message);
    return { message, code: ERROR_CODES.UNKNOWN_ERROR };
  }
}
