import { z } from "zod";

/**
 * Validation schema for creating a new category
 */
export const createCategorySchema = z.object({
  name: z.string().trim().min(2, { message: "Category name must be at least 2 characters long" }).max(100),
  gender: z.enum(["BOYS", "GIRLS"], {
    errorMap: () => ({ message: "Gender must be either 'BOYS' or 'GIRLS'" }),
  }),
  slug: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Validation schema for updating an existing category
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * Validation schema for query parameters when listing categories
 */
export const categoryQuerySchema = z.object({
  gender: z.enum(["BOYS", "GIRLS"]).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;
