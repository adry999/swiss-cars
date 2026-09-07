export type ErrorCode =
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'VALIDATION_ERROR'
    | 'DATABASE_ERROR'
    | 'NETWORK_ERROR'
    | 'UNKNOWN_ERROR';

export class AppError extends Error {
    constructor(
        public readonly code: ErrorCode,
        message: string,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super('NOT_FOUND', `${resource} not found`);
        this.name = 'NotFoundError';
    }
}

export class DatabaseError extends AppError {
    constructor(message: string, cause?: unknown) {
        super('DATABASE_ERROR', message, cause);
        this.name = 'DatabaseError';
    }
}

/**
 * User-friendly error messages by error code
 */
export const errorMessages: Record<ErrorCode, string> = {
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    DATABASE_ERROR: 'A database error occurred. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export function getUserFriendlyMessage(error: unknown): string {
    return error instanceof AppError
        ? errorMessages[error.code]
        : errorMessages.UNKNOWN_ERROR;
}
