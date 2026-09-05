import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import {
  carts,
  cartItems,
  products,
  productVariants,
  inventory,
} from "../db/schema";

export interface FormattedCartItem {
  id: number;
  productId: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: number;
    name: string;
    slug: string;
    brand: string | null;
    image: string | null;
  };
  variant: {
    id: number;
    size: string;
    color: string;
    sku: string;
    stock: number;
    inStock: boolean;
  };
}

export interface FormattedCart {
  id: number;
  userId: number;
  items: FormattedCartItem[];
  totalItems: number;
  subtotal: number;
  hasOutOfStockItems: boolean;
}

export class CartService {
  /**
   * Retrieves or creates the single active cart for a user.
   */
  public static async getOrCreateCart(userId: number) {
    const existing = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [created] = await db
      .insert(carts)
      .values({ userId })
      .returning();

    return created;
  }

  /**
   * Retrieves formatted cart with all items, current live variant pricing, and stock validation.
   */
  public static async getCart(userId: number): Promise<FormattedCart> {
    const cart = await this.getOrCreateCart(userId);

    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
      with: {
        product: {
          with: {
            images: true,
          },
        },
        variant: {
          with: {
            inventory: true,
          },
        },
      },
      orderBy: [desc(cartItems.createdAt)],
    });

    const formattedItems: FormattedCartItem[] = items.map((item) => {
      // Authoritative unit price from variant (never trust client)
      const unitPrice = parseFloat(item.variant.price);
      const stock = item.variant.inventory?.quantity ?? 0;
      const inStock = stock >= item.quantity;
      const totalPrice = Number((unitPrice * item.quantity).toFixed(2));

      // Get first sorted image
      const sortedImages = (item.product.images || []).sort((a, b) => a.sortOrder - b.sortOrder);
      const primaryImage = sortedImages.length > 0 ? sortedImages[0].imageUrl : null;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          brand: item.product.brand,
          image: primaryImage,
        },
        variant: {
          id: item.variant.id,
          size: item.variant.size,
          color: item.variant.color,
          sku: item.variant.sku,
          stock,
          inStock,
        },
      };
    });

    const totalItems = formattedItems.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = Number(
      formattedItems.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)
    );
    const hasOutOfStockItems = formattedItems.some((i) => !i.variant.inStock);

    return {
      id: cart.id,
      userId: cart.userId,
      items: formattedItems,
      totalItems,
      subtotal,
      hasOutOfStockItems,
    };
  }

  /**
   * Adds an item to the user's cart or increments quantity if already present.
   */
  public static async addItem(
    userId: number,
    productId: number,
    variantId: number,
    quantity: number
  ): Promise<FormattedCart> {
    const variant = await db.query.productVariants.findFirst({
      where: and(eq(productVariants.id, variantId), eq(productVariants.productId, productId)),
      with: {
        product: true,
        inventory: true,
      },
    });

    if (!variant) {
      throw new Error("Variant not found or does not belong to specified product");
    }

    if (!variant.product.isActive) {
      throw new Error("This product is currently inactive and cannot be purchased");
    }

    const availableStock = variant.inventory?.quantity ?? 0;
    if (availableStock <= 0) {
      throw new Error("Selected variant is currently out of stock");
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if variant is already in cart
    const existingItem = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, variantId)),
    });

    const currentQty = existingItem?.quantity ?? 0;
    const requestedTotal = currentQty + quantity;

    if (requestedTotal > availableStock) {
      throw new Error(
        `Cannot add ${quantity} more item(s). Available stock is ${availableStock}${
          currentQty > 0 ? ` (${currentQty} already in your cart)` : ""
        }.`
      );
    }

    if (existingItem) {
      await db
        .update(cartItems)
        .set({
          quantity: requestedTotal,
          price: variant.price, // Refresh price to latest variant price
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        price: variant.price, // Authoritative price from DB
      });
    }

    return await this.getCart(userId);
  }

  /**
   * Updates quantity of a specific cart item.
   * If quantity <= 0, item is deleted.
   */
  public static async updateQuantity(
    userId: number,
    itemId: number,
    quantity: number
  ): Promise<FormattedCart> {
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: {
        cart: true,
        variant: {
          with: {
            inventory: true,
          },
        },
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new Error("Cart item not found");
    }

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
      return await this.getCart(userId);
    }

    const availableStock = item.variant?.inventory?.quantity ?? 0;
    if (quantity > availableStock) {
      throw new Error(`Cannot set quantity to ${quantity}. Only ${availableStock} items are available in stock.`);
    }

    await db
      .update(cartItems)
      .set({
        quantity,
        price: item.variant.price,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, itemId));

    return await this.getCart(userId);
  }

  /**
   * Removes an item from the user's cart with ownership check.
   */
  public static async removeItem(userId: number, itemId: number): Promise<FormattedCart> {
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: {
        cart: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new Error("Cart item not found");
    }

    await db.delete(cartItems).where(eq(cartItems.id, itemId));
    return await this.getCart(userId);
  }

  /**
   * Clears all items in the user's cart.
   */
  public static async clearCart(userId: number): Promise<FormattedCart> {
    const cart = await this.getOrCreateCart(userId);
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return await this.getCart(userId);
  }
}
