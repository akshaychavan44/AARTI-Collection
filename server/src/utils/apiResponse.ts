/**
 * Standard API response structure for consistent client responses.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

/**
 * Helper to build a successful API response object.
 */
export const successResponse = <T>(message: string, data?: T): ApiResponse<T> => {
  return {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
};

/**
 * Helper to build an error API response object.
 */
export const errorResponse = (message: string, error?: unknown): ApiResponse => {
  return {
    success: false,
    message,
    ...(error !== undefined && { error }),
  };
};
