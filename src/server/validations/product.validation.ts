import { z } from "zod";

/**
 * Validation schema for a single product variant
 */
export const createVariantSchema = z.object({
  size: z.string().trim().min(1, { message: "Size is required" }).max(50),
  color: z.string().trim().min(1, { message: "Color is required" }).max(50),
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number greater than 0" }),
  sku: z.string().trim().min(2, { message: "SKU is required" }).max(100),
  quantity: z.coerce.number().int().min(0, { message: "Quantity cannot be negative" }).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
});

/**
 * Validation schema for a single product image
 */
export const createImageSchema = z.object({
  imageUrl: z.string().url({ message: "imageUrl must be a valid URL" }),
  altText: z.string().trim().max(255).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

/**
 * Validation schema for creating a product with its variants and images
 */
export const createProductSchema = z.object({
  categoryId: z.coerce.number().int().positive({ message: "Valid categoryId is required" }),
  name: z.string().trim().min(2, { message: "Product name must be at least 2 characters" }).max(255),
  slug: z.string().trim().min(2).max(300).optional(),
  description: z.string().trim().optional(),
  gender: z.enum(["BOYS", "GIRLS"], {
    errorMap: () => ({ message: "Gender must be either 'BOYS' or 'GIRLS'" }),
  }),
  ageGroup: z.enum(["0-2", "3-5", "6-9", "10-13", "14-16"], {
    errorMap: () => ({ message: "Age group must be one of: 0-2, 3-5, 6-9, 10-13, 14-16" }),
  }),
  compareAtPrice: z.coerce.number().positive().optional(),
  isFeatured: z.boolean().optional().default(false),
  brand: z.string().trim().max(100).optional().default("Kalyan Kids"),
  isActive: z.boolean().optional().default(true),
  variants: z
    .array(createVariantSchema)
    .min(1, { message: "Product must have at least one variant (size/color)" }),
  images: z.array(createImageSchema).optional().default([]),
});

/**
 * Validation schema for updating a product (basic info)
 */
export const updateProductSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2).max(255).optional(),
  slug: z.string().trim().min(2).max(300).optional(),
  description: z.string().trim().optional(),
  gender: z.enum(["BOYS", "GIRLS"]).optional(),
  ageGroup: z.enum(["0-2", "3-5", "6-9", "10-13", "14-16"]).optional(),
  compareAtPrice: z.coerce.number().positive().nullable().optional(),
  isFeatured: z.boolean().optional(),
  brand: z.string().trim().max(100).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Validation schema for product query parameters (filtering, search, pagination, sorting)
 */
export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  gender: z.enum(["BOYS", "GIRLS"]).optional(),
  category: z.string().trim().optional(), // Can be category ID or slug
  ageGroup: z.enum(["0-2", "3-5", "6-9", "10-13", "14-16"]).optional(),
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0, { message: "minPrice cannot be negative" }).optional(),
  maxPrice: z.coerce.number().min(0, { message: "maxPrice cannot be negative" }).optional(),
  isFeatured: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  availability: z.enum(["in_stock", "all"]).optional().default("all"),
  sortBy: z
    .enum(["featured", "newest", "price_asc", "price_desc", "name_asc"])
    .optional()
    .default("featured"),
  page: z.coerce.number().int().min(1, { message: "Page must be at least 1" }).default(1),
  limit: z.coerce.number().int().min(1).max(50, { message: "Limit cannot exceed 50" }).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;
