import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import {
  wishlists,
  wishlistItems,
  products,
  calculateStockStatus,
  StockStatus,
} from "../db/schema";
import { CartService } from "./cart.service";

export interface FormattedWishlistItem {
  id: number;
  productId: number;
  createdAt: Date;
  product: {
    id: number;
    name: string;
    slug: string;
    brand: string | null;
    gender: "BOYS" | "GIRLS";
    ageGroup: "0-2" | "3-5" | "6-9" | "10-13" | "14-16";
    isFeatured: boolean;
    compareAtPrice: string | null;
    discountPercentage: number | null;
    image: string | null;
    category: {
      id: number;
      name: string;
      slug: string;
    } | null;
    priceRange: {
      min: number;
      max: number;
    };
    overallStockStatus: StockStatus;
    hasStock: boolean;
    firstAvailableVariantId: number | null;
  };
}

export interface FormattedWishlist {
  id: number;
  userId: number;
  totalItems: number;
  items: FormattedWishlistItem[];
}

export class WishlistService {
  /**
   * Retrieves or creates the single active wishlist for a user.
   */
  public static async getOrCreateWishlist(userId: number) {
    const existing = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [created] = await db
      .insert(wishlists)
      .values({ userId })
      .returning();

    return created;
  }

  /**
   * Retrieves user wishlist with full product details, pricing, and variant availability.
   */
  public static async getWishlist(userId: number): Promise<FormattedWishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);

    const items = await db.query.wishlistItems.findMany({
      where: eq(wishlistItems.wishlistId, wishlist.id),
      with: {
        product: {
          with: {
            category: true,
            images: true,
            variants: {
              with: {
                inventory: true,
              },
            },
          },
        },
      },
      orderBy: [desc(wishlistItems.createdAt)],
    });

    const formattedItems: FormattedWishlistItem[] = items.map((item) => {
      const p = item.product;
      const sortedImages = (p.images || []).sort((a, b) => a.sortOrder - b.sortOrder);
      const primaryImage = sortedImages.length > 0 ? sortedImages[0].imageUrl : null;

      const prices = (p.variants || [])
        .map((v) => parseFloat(v.price))
        .filter((n) => !isNaN(n));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      const compareAt = p.compareAtPrice ? parseFloat(p.compareAtPrice) : null;
      const discountPercentage =
        compareAt && minPrice && compareAt > minPrice
          ? Math.round(((compareAt - minPrice) / compareAt) * 100)
          : null;

      const totalStock = (p.variants || []).reduce(
        (sum, v) => sum + (v.inventory?.quantity ?? 0),
        0
      );
      const overallStockStatus: StockStatus =
        totalStock <= 0
          ? "OUT_OF_STOCK"
          : (p.variants || []).some(
              (v) =>
                calculateStockStatus(
                  v.inventory?.quantity ?? 0,
                  v.inventory?.lowStockThreshold ?? 5
                ) !== "IN_STOCK"
            )
          ? "LOW_STOCK"
          : "IN_STOCK";

      // Find first available variant that is in stock
      const availableVariant = (p.variants || []).find(
        (v) => (v.inventory?.quantity ?? 0) > 0
      );

      return {
        id: item.id,
        productId: item.productId,
        createdAt: item.createdAt,
        product: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          gender: p.gender,
          ageGroup: p.ageGroup,
          isFeatured: p.isFeatured ?? false,
          compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : null,
          discountPercentage,
          image: primaryImage,
          category: p.category
            ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
            : null,
          priceRange: { min: minPrice, max: maxPrice },
          overallStockStatus,
          hasStock: totalStock > 0,
          firstAvailableVariantId: availableVariant ? availableVariant.id : null,
        },
      };
    });

    return {
      id: wishlist.id,
      userId: wishlist.userId,
      totalItems: formattedItems.length,
      items: formattedItems,
    };
  }

  /**
   * Adds a product to the user's wishlist idempotently.
   */
  public static async addItem(userId: number, productId: number): Promise<FormattedWishlist> {
    const product = await db
      .select({ id: products.id, isActive: products.isActive })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      throw new Error("Product not found");
    }

    if (!product[0].isActive) {
      throw new Error("Product is no longer active");
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    const existing = await db
      .select({ id: wishlistItems.id })
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist.id),
          eq(wishlistItems.productId, productId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(wishlistItems).values({
        wishlistId: wishlist.id,
        productId,
      });
    }

    return await this.getWishlist(userId);
  }

  /**
   * Removes a product from the user's wishlist.
   */
  public static async removeItem(userId: number, productId: number): Promise<FormattedWishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);

    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist.id),
          eq(wishlistItems.productId, productId)
        )
      );

    return await this.getWishlist(userId);
  }

  /**
   * Moves a product from wishlist to cart.
   * If variantId is not specified, selects the first in-stock variant.
   */
  public static async moveToCart(userId: number, productId: number, variantId?: number) {
    let targetVariantId = variantId;

    if (!targetVariantId) {
      const p = await db.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
          variants: {
            with: {
              inventory: true,
            },
          },
        },
      });

      if (!p) {
        throw new Error("Product not found");
      }

      const availableVariant = (p.variants || []).find(
        (v) => (v.inventory?.quantity ?? 0) > 0
      );

      if (!availableVariant) {
        throw new Error("Product is currently out of stock and cannot be moved to cart");
      }

      targetVariantId = availableVariant.id;
    }

    // Add to cart
    const updatedCart = await CartService.addItem(userId, productId, targetVariantId, 1);

    // Remove from wishlist
    const updatedWishlist = await this.removeItem(userId, productId);

    return {
      cart: updatedCart,
      wishlist: updatedWishlist,
    };
  }
}
