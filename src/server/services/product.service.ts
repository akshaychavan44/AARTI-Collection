import { eq, and, or, ilike, gte, lte, gt, sql, inArray, desc, asc } from "drizzle-orm";
import { db } from "../db";
import {
  products,
  categories,
  productImages,
  productVariants,
  inventory,
  orderItems,
  calculateStockStatus,
  StockStatus,
} from "../db/schema";
import { CreateProductInput, UpdateProductInput, ProductQueryParams } from "../validations/product.validation";
import { slugify } from "../utils/slugify";

export interface FormattedVariant {
  id: number;
  size: string;
  color: string;
  price: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
}

export interface FormattedProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  gender: "BOYS" | "GIRLS";
  ageGroup: "0-2" | "3-5" | "6-9" | "10-13" | "14-16";
  brand: string | null;
  isActive: boolean;
  isFeatured: boolean;
  compareAtPrice: string | null;
  discountPercentage: number | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  images: {
    id: number;
    imageUrl: string;
    altText: string | null;
    sortOrder: number;
  }[];
  variants: FormattedVariant[];
  priceRange: {
    min: number;
    max: number;
  };
  overallStockStatus: StockStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductService {
  /**
   * Helper to format raw relational product into consistent API response.
   */
  private static formatProduct(p: any): FormattedProduct {
    const formattedVariants: FormattedVariant[] = (p.variants || []).map((v: any) => {
      const quantity = v.inventory?.quantity ?? 0;
      const threshold = v.inventory?.lowStockThreshold ?? 5;
      return {
        id: v.id,
        size: v.size,
        color: v.color,
        price: v.price,
        sku: v.sku,
        stock: quantity,
        lowStockThreshold: threshold,
        stockStatus: calculateStockStatus(quantity, threshold),
      };
    });

    // Calculate price range
    const prices = formattedVariants.map((v) => parseFloat(v.price)).filter((n) => !isNaN(n));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Calculate discount percentage if compareAtPrice is higher than minPrice
    const compareAt = p.compareAtPrice ? parseFloat(p.compareAtPrice) : null;
    const discountPercentage =
      compareAt && minPrice && compareAt > minPrice
        ? Math.round(((compareAt - minPrice) / compareAt) * 100)
        : null;

    // Calculate overall stock status
    const totalStock = formattedVariants.reduce((sum, v) => sum + v.stock, 0);
    const overallStockStatus =
      totalStock <= 0
        ? "OUT_OF_STOCK"
        : formattedVariants.some((v) => v.stockStatus === "LOW_STOCK" || v.stockStatus === "OUT_OF_STOCK")
        ? "LOW_STOCK"
        : "IN_STOCK";

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      gender: p.gender,
      ageGroup: p.ageGroup,
      brand: p.brand,
      isActive: p.isActive,
      isFeatured: p.isFeatured ?? false,
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : null,
      discountPercentage,
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
      images: (p.images || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder),
      variants: formattedVariants,
      priceRange: { min: minPrice, max: maxPrice },
      overallStockStatus,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  /**
   * Search, filter, and paginate products using SQL queries.
   */
  public static async getProducts(params: ProductQueryParams) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const offset = (page - 1) * limit;

    const productConditions = [eq(products.isActive, true)];

    // 1. Text Search (Matches product name or description)
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      productConditions.push(
        or(ilike(products.name, searchTerm), ilike(products.description, searchTerm))!
      );
    }

    // 2. Filter by Gender
    if (params.gender) {
      productConditions.push(eq(products.gender, params.gender));
    }

    // 3. Filter by Age Group
    if (params.ageGroup) {
      productConditions.push(eq(products.ageGroup, params.ageGroup));
    }

    // 4. Filter by Category (Supports ID or Slug)
    if (params.category) {
      const isNumeric = /^\d+$/.test(params.category);
      if (isNumeric) {
        productConditions.push(eq(products.categoryId, parseInt(params.category, 10)));
      } else {
        const cat = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.slug, params.category))
          .limit(1);
        if (cat.length > 0) {
          productConditions.push(eq(products.categoryId, cat[0].id));
        } else {
          // Category slug does not exist, return empty
          return { products: [], pagination: { page, limit, total: 0, totalPages: 0 } };
        }
      }
    }

    // 5. Filter by isFeatured
    if (params.isFeatured !== undefined) {
      productConditions.push(eq(products.isFeatured, params.isFeatured));
    }

    // 6. Filter by Brand
    if (params.brand) {
      productConditions.push(ilike(products.brand, `%${params.brand}%`));
    }

    // 7. Filter by Availability (in_stock)
    if (params.availability === "in_stock") {
      const inStockProductIds = db
        .selectDistinct({ productId: productVariants.productId })
        .from(productVariants)
        .innerJoin(inventory, eq(productVariants.id, inventory.variantId))
        .where(gt(inventory.quantity, 0));
      productConditions.push(inArray(products.id, inStockProductIds));
    }

    // 8. Variant-level filters (size, color, minPrice, maxPrice)
    const variantConditions = [];
    if (params.size) {
      variantConditions.push(ilike(productVariants.size, params.size));
    }
    if (params.color) {
      variantConditions.push(ilike(productVariants.color, params.color));
    }
    if (params.minPrice !== undefined) {
      variantConditions.push(gte(productVariants.price, params.minPrice.toString()));
    }
    if (params.maxPrice !== undefined) {
      variantConditions.push(lte(productVariants.price, params.maxPrice.toString()));
    }

    // If variant filters exist, constrain matching product IDs using an SQL subquery
    if (variantConditions.length > 0) {
      const matchingProductIds = db
        .selectDistinct({ productId: productVariants.productId })
        .from(productVariants)
        .where(and(...variantConditions));

      productConditions.push(inArray(products.id, matchingProductIds));
    }

    const whereClause = and(...productConditions);

    // 9. Execute SQL Count Query for Pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(${products.id})` })
      .from(products)
      .where(whereClause);

    const total = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // 10. Dynamic Order By
    let orderBy: any[];
    switch (params.sortBy) {
      case "newest":
        orderBy = [desc(products.createdAt)];
        break;
      case "name_asc":
        orderBy = [asc(products.name)];
        break;
      case "price_asc":
        orderBy = [
          asc(
            sql`(SELECT MIN(price::numeric) FROM product_variants WHERE product_variants.product_id = ${products.id})`
          ),
          desc(products.createdAt),
        ];
        break;
      case "price_desc":
        orderBy = [
          desc(
            sql`(SELECT MAX(price::numeric) FROM product_variants WHERE product_variants.product_id = ${products.id})`
          ),
          desc(products.createdAt),
        ];
        break;
      case "featured":
      default:
        orderBy = [desc(products.isFeatured), desc(products.createdAt)];
        break;
    }

    // 11. Execute SQL Paginated Query with Relations
    const productList = await db.query.products.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy,
      with: {
        category: true,
        images: true,
        variants: {
          with: {
            inventory: true,
          },
        },
      },
    });

    const formatted = productList.map((p) => this.formatProduct(p));

    return {
      products: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Retrieve single product by ID.
   */
  public static async getProductById(id: number): Promise<FormattedProduct | null> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        images: true,
        variants: {
          with: {
            inventory: true,
          },
        },
      },
    });

    return product ? this.formatProduct(product) : null;
  }

  /**
   * Retrieve single product by slug.
   */
  public static async getProductBySlug(slug: string): Promise<FormattedProduct | null> {
    const product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
      with: {
        category: true,
        images: true,
        variants: {
          with: {
            inventory: true,
          },
        },
      },
    });

    return product ? this.formatProduct(product) : null;
  }

  /**
   * Create a new product with variants, initial inventory, and images.
   */
  public static async createProduct(data: CreateProductInput): Promise<FormattedProduct> {
    // 1. Check if Category exists
    const categoryExists = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, data.categoryId))
      .limit(1);

    if (categoryExists.length === 0) {
      throw new Error(`Category with ID ${data.categoryId} does not exist`);
    }

    // 2. Generate unique slug
    const baseSlug = data.slug ? slugify(data.slug) : slugify(data.name);
    const existingSlug = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, baseSlug))
      .limit(1);

    const finalSlug = existingSlug.length > 0 ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    // 3. Check for duplicate SKUs in input
    const skus = data.variants.map((v) => v.sku);
    const uniqueSkus = new Set(skus);
    if (uniqueSkus.size !== skus.length) {
      throw new Error("Duplicate SKUs detected within the variant list.");
    }

    // Check if any SKU already exists in DB
    const existingSkuRecords = await db
      .select({ sku: productVariants.sku })
      .from(productVariants)
      .where(inArray(productVariants.sku, skus));

    if (existingSkuRecords.length > 0) {
      throw new Error(`SKU '${existingSkuRecords[0].sku}' is already taken.`);
    }

    // 4. Insert product record
    const [newProduct] = await db
      .insert(products)
      .values({
        categoryId: data.categoryId,
        name: data.name,
        slug: finalSlug,
        gender: data.gender,
        ageGroup: data.ageGroup,
        brand: data.brand || "Kalyan Kids",
        description: data.description,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toString() : null,
      })
      .returning();

    // 5. Insert images
    if (data.images && data.images.length > 0) {
      await db.insert(productImages).values(
        data.images.map((img, idx) => ({
          productId: newProduct.id,
          imageUrl: img.imageUrl,
          altText: img.altText || data.name,
          sortOrder: img.sortOrder ?? idx,
        }))
      );
    }

    // 6. Insert variants and inventory
    for (const variant of data.variants) {
      const [insertedVariant] = await db
        .insert(productVariants)
        .values({
          productId: newProduct.id,
          size: variant.size,
          color: variant.color,
          price: variant.price.toString(),
          sku: variant.sku,
        })
        .returning();

      await db.insert(inventory).values({
        variantId: insertedVariant.id,
        quantity: variant.quantity ?? 0,
        lowStockThreshold: variant.lowStockThreshold ?? 5,
      });
    }

    const fullProduct = await this.getProductById(newProduct.id);
    if (!fullProduct) {
      throw new Error("Failed to load created product");
    }
    return fullProduct;
  }

  /**
   * Update full product details including basic info, variants, inventory, and images.
   */
  public static async updateProduct(id: number, data: UpdateProductInput): Promise<FormattedProduct | null> {
    const existing = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (existing.length === 0) return null;

    if (data.categoryId) {
      const cat = await db.select().from(categories).where(eq(categories.id, data.categoryId)).limit(1);
      if (cat.length === 0) {
        throw new Error(`Category with ID ${data.categoryId} not found`);
      }
    }

    const { variants, images, ...baseFields } = data;

    const updatePayload: any = {
      updatedAt: new Date(),
    };

    if (baseFields.name !== undefined) updatePayload.name = baseFields.name;
    if (baseFields.description !== undefined) updatePayload.description = baseFields.description;
    if (baseFields.categoryId !== undefined) updatePayload.categoryId = baseFields.categoryId;
    if (baseFields.gender !== undefined) updatePayload.gender = baseFields.gender;
    if (baseFields.ageGroup !== undefined) updatePayload.ageGroup = baseFields.ageGroup;
    if (baseFields.brand !== undefined) updatePayload.brand = baseFields.brand;
    if (baseFields.isFeatured !== undefined) updatePayload.isFeatured = baseFields.isFeatured;
    if (baseFields.isActive !== undefined) updatePayload.isActive = baseFields.isActive;
    if (baseFields.compareAtPrice !== undefined) {
      updatePayload.compareAtPrice = baseFields.compareAtPrice ? baseFields.compareAtPrice.toString() : null;
    }

    if (baseFields.slug) {
      updatePayload.slug = slugify(baseFields.slug);
    } else if (baseFields.name && !existing[0].slug.startsWith(slugify(baseFields.name))) {
      updatePayload.slug = slugify(baseFields.name);
    }

    await db.update(products).set(updatePayload).where(eq(products.id, id));

    // 1. Synchronize Images if provided
    if (images !== undefined) {
      await db.delete(productImages).where(eq(productImages.productId, id));
      if (images.length > 0) {
        await db.insert(productImages).values(
          images.map((img, idx) => ({
            productId: id,
            imageUrl: img.imageUrl,
            altText: img.altText || baseFields.name || existing[0].name,
            sortOrder: img.sortOrder ?? idx,
          }))
        );
      }
    }

    // 2. Synchronize Variants & Inventory if provided
    if (variants !== undefined) {
      const existingVariants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, id));

      const existingVariantIds = new Set(existingVariants.map((v) => v.id));
      const incomingVariantIds = new Set(
        variants.filter((v) => v.id !== undefined).map((v) => v.id as number)
      );

      // Identify variants to delete
      const toDeleteIds = existingVariants
        .filter((v) => !incomingVariantIds.has(v.id))
        .map((v) => v.id);

      if (toDeleteIds.length > 0) {
        const usedInOrders = await db
          .select({ variantId: orderItems.variantId })
          .from(orderItems)
          .where(inArray(orderItems.variantId, toDeleteIds));

        const usedVariantIdSet = new Set(usedInOrders.map((o) => o.variantId));
        const safeToDeleteIds = toDeleteIds.filter((vid) => !usedVariantIdSet.has(vid));

        // For variants tied to historical order snapshots, set inventory stock to 0
        for (const vid of toDeleteIds) {
          if (usedVariantIdSet.has(vid)) {
            await db
              .update(inventory)
              .set({ quantity: 0, updatedAt: new Date() })
              .where(eq(inventory.variantId, vid));
          }
        }

        if (safeToDeleteIds.length > 0) {
          await db.delete(productVariants).where(inArray(productVariants.id, safeToDeleteIds));
        }
      }

      // Upsert incoming variants
      for (const v of variants) {
        if (v.id && existingVariantIds.has(v.id)) {
          // Update variant attributes
          await db
            .update(productVariants)
            .set({
              size: v.size,
              color: v.color,
              price: v.price.toString(),
              sku: v.sku,
              updatedAt: new Date(),
            })
            .where(eq(productVariants.id, v.id));

          // Upsert inventory
          const existingInv = await db
            .select()
            .from(inventory)
            .where(eq(inventory.variantId, v.id))
            .limit(1);

          if (existingInv.length > 0) {
            await db
              .update(inventory)
              .set({
                quantity: v.quantity ?? 0,
                lowStockThreshold: v.lowStockThreshold ?? 5,
                updatedAt: new Date(),
              })
              .where(eq(inventory.variantId, v.id));
          } else {
            await db.insert(inventory).values({
              variantId: v.id,
              quantity: v.quantity ?? 0,
              lowStockThreshold: v.lowStockThreshold ?? 5,
            });
          }
        } else {
          // Insert new variant
          const [insertedVariant] = await db
            .insert(productVariants)
            .values({
              productId: id,
              size: v.size,
              color: v.color,
              price: v.price.toString(),
              sku: v.sku,
            })
            .returning();

          await db.insert(inventory).values({
            variantId: insertedVariant.id,
            quantity: v.quantity ?? 0,
            lowStockThreshold: v.lowStockThreshold ?? 5,
          });
        }
      }
    }

    return await this.getProductById(id);
  }

  /**
   * Delete product by ID.
   */
  public static async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
    return result.length > 0;
  }
}
