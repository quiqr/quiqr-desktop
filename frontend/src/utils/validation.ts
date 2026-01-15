import { z } from 'zod';

/**
 * Validates a service method response using a Zod schema.
 * The return type is automatically inferred from the schema.
 *
 * @param methodName - Name of the service method for error reporting
 * @param schema - Zod schema to validate against
 * @param response - The response data to validate
 * @returns Validated and typed response data
 * @throws Error if validation fails
 */
export function validateServiceResponse<T extends z.ZodType>(
  methodName: string,
  schema: T | undefined,
  response: unknown
): z.infer<T> {
  if (!schema) {
    console.warn(`[Service Validation] No schema found for method: ${methodName}`);
    return response as z.infer<T>;
  }

  try {
    const validated = schema.parse(response);
    return validated as z.infer<T>;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`[Service Validation] Schema validation failed for ${methodName}:`, error.errors);
      console.error('Response data:', JSON.stringify(response, null, 2));
      throw new Error(`Service response validation failed for ${methodName}: ${error.message}`);
    }
    throw error;
  }
}
