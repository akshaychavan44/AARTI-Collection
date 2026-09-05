import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

type RequestLocation = "body" | "query" | "params";

/**
 * Middleware factory to validate incoming requests against a Zod schema.
 * 
 * @param schema - Zod schema to validate against
 * @param source - Request property to validate ('body', 'query', or 'params')
 */
export const validate = (schema: AnyZodObject, source: RequestLocation = "body") => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errorMessages,
        });
        return;
      }
      next(error);
    }
  };
};
