import { z } from 'zod';

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: z.ZodIssue[],
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function createValidationError(
  result: z.SafeParseError<any>,
  context?: Record<string, unknown>
): ValidationError {
  const message = result.error.issues
    .map(issue => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');
  
  return new ValidationError(
    `Validation failed: ${message}`,
    result.error.issues,
    context
  );
}

export function validateWithError<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: Record<string, unknown>
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw createValidationError(result, context);
  }
  return result.data;
}

export function validateSafely<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ValidationError } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: createValidationError(result)
    };
  }
  return { success: true, data: result.data };
}