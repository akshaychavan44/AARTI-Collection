import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { categories, Category, products } from "../db/schema";
import { CreateCategoryInput, UpdateCategoryInput, CategoryQueryParams } from "../validations/category.validation";
import { slugify } from "../utils/slugify";
import { AdminService } from "./admin.service";

let cachedAllCategories: { data: Category[]; expiresAt: number } | null = null;
const CATEGORIES_CACHE_TTL_MS = 60_000;

export class CategoryService {
  public static invalidateCache(): void {
    cachedAllCategories = null;
    AdminService.invalidateStatsCache();
  }

  /**
   * Fetch all categories with optional gender or active status filtering.
   * Utilizes in-memory caching when fetching unfiltered categories.
   */
  public static async getAllCategories(params?: CategoryQueryParams): Promise<Category[]> {
    const isUnfiltered = !params?.gender && params?.isActive === undefined;

    if (isUnfiltered && cachedAllCategories && Date.now() < cachedAllCategories.expiresAt) {
      return cachedAllCategories.data;
    }

    const conditions = [];

    if (params?.gender) {
      conditions.push(eq(categories.gender, params.gender));
    }

    if (params?.isActive !== undefined) {
      conditions.push(eq(categories.isActive, params.isActive));
    }

    let results: Category[];

    if (conditions.length > 0) {
      results = await db
        .select()
        .from(categories)
        .where(and(...conditions))
        .orderBy(categories.name);
    } else {
      results = await db.select().from(categories).orderBy(categories.name);
    }

    if (isUnfiltered) {
      cachedAllCategories = {
        data: results,
        expiresAt: Date.now() + CATEGORIES_CACHE_TTL_MS,
      };
    }

    return results;
  }

  /**
   * Fetch single category by primary key ID.
   */
  public static async getCategoryById(id: number): Promise<Category | null> {
    const results = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return results[0] || null;
  }

  /**
   * Create a new category with a unique slug.
   */
  public static async createCategory(data: CreateCategoryInput): Promise<Category> {
    const slugBase = data.slug ? slugify(data.slug) : slugify(`${data.gender}-${data.name}`);

    // Check if slug already exists
    const existing = await db.select().from(categories).where(eq(categories.slug, slugBase)).limit(1);
    const finalSlug = existing.length > 0 ? `${slugBase}-${Date.now().toString().slice(-4)}` : slugBase;

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: data.name,
        gender: data.gender,
        slug: finalSlug,
        description: data.description,
        isActive: data.isActive ?? true,
      })
      .returning();

    CategoryService.invalidateCache();
    return newCategory;
  }

  /**
   * Update category fields by ID.
   */
  public static async updateCategory(id: number, data: UpdateCategoryInput): Promise<Category | null> {
    const existing = await this.getCategoryById(id);
    if (!existing) return null;

    const updatePayload: Partial<typeof categories.$inferInsert> = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.name && !data.slug) {
      updatePayload.slug = slugify(`${data.gender || existing.gender}-${data.name}`);
    } else if (data.slug) {
      updatePayload.slug = slugify(data.slug);
    }

    const [updated] = await db
      .update(categories)
      .set(updatePayload)
      .where(eq(categories.id, id))
      .returning();

    CategoryService.invalidateCache();
    return updated || null;
  }

  /**
   * Delete a category by ID (rejects if products are currently associated with it).
   */
  public static async deleteCategory(id: number): Promise<{ success: boolean; message: string }> {
    const existing = await this.getCategoryById(id);
    if (!existing) {
      return { success: false, message: "Category not found" };
    }

    // Check for existing products under this category
    const associatedProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, id))
      .limit(1);

    if (associatedProducts.length > 0) {
      return {
        success: false,
        message: "Cannot delete category because active products are assigned to it. Please reassign or remove products first.",
      };
    }

    await db.delete(categories).where(eq(categories.id, id));
    CategoryService.invalidateCache();
    return { success: true, message: "Category deleted successfully" };
  }
}
