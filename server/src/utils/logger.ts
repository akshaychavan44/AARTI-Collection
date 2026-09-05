/**
 * Simple, clean logging utility with timestamps.
 */
export const logger = {
  info: (message: string, ...meta: unknown[]) => {
    console.log(`[${new Date().toISOString()}] [INFO]: ${message}`, ...meta);
  },
  warn: (message: string, ...meta: unknown[]) => {
    console.warn(`[${new Date().toISOString()}] [WARN]: ${message}`, ...meta);
  },
  error: (message: string, ...meta: unknown[]) => {
    console.error(`[${new Date().toISOString()}] [ERROR]: ${message}`, ...meta);
  },
  success: (message: string, ...meta: unknown[]) => {
    console.log(`[${new Date().toISOString()}] [SUCCESS]: ✅ ${message}`, ...meta);
  },
};
