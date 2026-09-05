import { relations } from "drizzle-orm";
import { categories } from "./categories";
import { products } from "./products";
import { productImages } from "./images";
import { productVariants } from "./variants";
import { inventory } from "./inventory";
import { users } from "./users";
import { passwordResetTokens } from "./tokens";
import { carts, cartItems } from "./cart";
import { wishlists, wishlistItems } from "./wishlist";
import { orders, orderItems } from "./orders";
import { coupons } from "./coupons";

/**
 * Category Relations
 */
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

/**
 * Product Relations
 */
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
  orderItems: many(orderItems),
}));

/**
 * Product Image Relations
 */
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

/**
 * Product Variant Relations
 */
export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  inventory: one(inventory, {
    fields: [productVariants.id],
    references: [inventory.variantId],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

/**
 * Inventory Relations
 */
export const inventoryRelations = relations(inventory, ({ one }) => ({
  variant: one(productVariants, {
    fields: [inventory.variantId],
    references: [productVariants.id],
  }),
}));

/**
 * User Relations
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  resetTokens: many(passwordResetTokens),
  cart: one(carts, {
    fields: [users.id],
    references: [carts.userId],
  }),
  wishlist: one(wishlists, {
    fields: [users.id],
    references: [wishlists.userId],
  }),
  orders: many(orders),
}));

/**
 * Password Reset Token Relations
 */
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

/**
 * Cart Relations
 */
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

/**
 * Cart Items Relations
 */
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

/**
 * Wishlist Relations
 */
export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  items: many(wishlistItems),
}));

/**
 * Wishlist Items Relations
 */
export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

/**
 * Order Relations
 */
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

/**
 * Order Items Relations
 */
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));
