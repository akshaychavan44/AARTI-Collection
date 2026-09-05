import { eq, and, or, ilike, sql, inArray, desc, count } from "drizzle-orm";
import { db } from "../db";
import {
  products,
  categories,
  productImages,
  productVariants,
  inventory,
  users,
  orders,
  orderItems,
  coupons,
  cartItems,
  wishlistItems,
  SafeUser,
} from "../db/schema";
import { ProductService, FormattedProduct } from "./product.service";
import { OrderService, FormattedOrder } from "./order.service";

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    createdAt: Date;
    itemCount: number;
  }>;
}

export interface AdminProductItem {
  id: number;
  name: string;
  slug: string;
  category: { id: number; name: string } | null;
  gender: string;
  ageGroup: string;
  brand: string | null;
  isActive: boolean;
  isFeatured: boolean;
  compareAtPrice: string | null;
  totalStock: number;
  variantCount: number;
  primaryImage: string | null;
  priceRange: { min: number; max: number };
  createdAt: Date;
}

export interface AdminCustomerItem {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  isActive: boolean;
  orderCount: number;
  totalSpent: number;
  createdAt: Date;
}

export class AdminService {
  /**
   * Retrieves clean aggregated metrics for the Admin Dashboard.
   */
  public static async getDashboardStats(): Promise<DashboardStats> {
    // 1. Total Products
    const [prodCount] = await db.select({ count: sql<number>`count(*)::int` }).from(products);

    // 2. Total Categories
    const [catCount] = await db.select({ count: sql<number>`count(*)::int` }).from(categories);

    // 3. Total Orders
    const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);

    // 4. Total Customers
    const [custCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "CUSTOMER"));

    // 5. Orders by status
    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, "PENDING"));

    const [confirmedCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, "CONFIRMED"));

    // 6. Total Revenue (sum of total for PAID or CONFIRMED orders)
    const [revenueResult] = await db
      .select({
        total: sql<string>`coalesce(sum(case when payment_status = 'PAID' or status = 'CONFIRMED' then total::numeric else 0 end), 0)`,
      })
      .from(orders);

    const totalRevenue = parseFloat(revenueResult?.total || "0");

    // 7. Low stock variants count
    const [lowStockResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventory)
      .where(sql`${inventory.quantity} <= ${inventory.lowStockThreshold}`);

    // 8. Recent 5 Orders with customer info
    const rawRecentOrders = await db.query.orders.findMany({
      limit: 5,
      orderBy: [desc(orders.createdAt)],
      with: {
        user: true,
        items: true,
      },
    });

    const recentOrders = rawRecentOrders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || "Customer",
      customerEmail: o.user?.email || "customer@example.com",
      total: parseFloat(o.total),
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      itemCount: o.items?.length || 0,
    }));

    return {
      totalProducts: prodCount?.count || 0,
      totalCategories: catCount?.count || 0,
      totalOrders: orderCount?.count || 0,
      totalCustomers: custCount?.count || 0,
      pendingOrders: pendingCount?.count || 0,
      confirmedOrders: confirmedCount?.count || 0,
      totalRevenue,
      lowStockCount: lowStockResult?.count || 0,
      recentOrders,
    };
  }

  /**
   * Retrieves products for the admin panel with search, category, and status filters.
   */
  public static async getProducts(params?: {
    search?: string;
    categoryId?: number;
    status?: "all" | "active" | "inactive";
  }): Promise<AdminProductItem[]> {
    const conditions = [];

    if (params?.search) {
      const q = `%${params.search}%`;
      conditions.push(or(ilike(products.name, q), ilike(products.description, q)));
    }

    if (params?.categoryId) {
      conditions.push(eq(products.categoryId, params.categoryId));
    }

    if (params?.status === "active") {
      conditions.push(eq(products.isActive, true));
    } else if (params?.status === "inactive") {
      conditions.push(eq(products.isActive, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db.query.products.findMany({
      where: whereClause,
      orderBy: [desc(products.createdAt)],
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

    return list.map((p: any) => {
      const variants = p.variants || [];
      const totalStock = variants.reduce(
        (sum: number, v: any) => sum + (v.inventory?.quantity || 0),
        0
      );
      const prices = variants.map((v: any) => parseFloat(v.price)).filter((n: number) => !isNaN(n));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const primaryImg = p.images?.find((img: any) => img.sortOrder === 0) || p.images?.[0];

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category ? { id: p.category.id, name: p.category.name } : null,
        gender: p.gender,
        ageGroup: p.ageGroup,
        brand: p.brand,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : null,
        totalStock,
        variantCount: variants.length,
        primaryImage: primaryImg ? primaryImg.imageUrl : null,
        priceRange: { min: minPrice, max: maxPrice },
        createdAt: p.createdAt,
      };
    });
  }

  /**
   * Safe Product Deletion.
   * If the product has historical purchases in `order_items`, deactivates it (`isActive = false`)
   * to protect referential integrity and order history.
   * If not purchased, deletes associated inventory, variants, cart items, wishlist items, and product.
   */
  public static async deleteProductSafely(productId: number): Promise<{
    deleted: boolean;
    deactivated: boolean;
    message: string;
  }> {
    // 1. Check if product is in any order
    const [orderItemCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orderItems)
      .where(eq(orderItems.productId, productId));

    if (orderItemCount && orderItemCount.count > 0) {
      // Soft-deactivate to protect historical customer orders
      await db
        .update(products)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(products.id, productId));

      return {
        deleted: false,
        deactivated: true,
        message: `Product has been purchased in ${orderItemCount.count} order(s). It has been deactivated to preserve customer order receipts.`,
      };
    }

    // 2. Not in orders: Clean up relational references
    // Carts & Wishlists
    const variantIds = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    const vIds = variantIds.map((v) => v.id);

    if (vIds.length > 0) {
      await db.delete(cartItems).where(inArray(cartItems.variantId, vIds));
      await db.delete(inventory).where(inArray(inventory.variantId, vIds));
      await db.delete(productVariants).where(eq(productVariants.productId, productId));
    }

    await db.delete(wishlistItems).where(eq(wishlistItems.productId, productId));
    await db.delete(productImages).where(eq(productImages.productId, productId));
    await db.delete(products).where(eq(products.id, productId));

    return {
      deleted: true,
      deactivated: false,
      message: "Product and all its variants have been safely removed.",
    };
  }

  /**
   * Toggle product active status.
   */
  public static async toggleProductStatus(productId: number): Promise<boolean> {
    const [prod] = await db
      .select({ isActive: products.isActive })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!prod) throw new Error("Product not found");

    const newStatus = !prod.isActive;
    await db
      .update(products)
      .set({ isActive: newStatus, updatedAt: new Date() })
      .where(eq(products.id, productId));

    return newStatus;
  }

  /**
   * Retrieves categories with count of assigned products.
   */
  public static async getCategoriesWithCounts() {
    const catList = await db.query.categories.findMany({
      orderBy: [categories.name],
    });

    const counts = await db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .groupBy(products.categoryId);

    const countMap = new Map<number, number>();
    counts.forEach((c) => {
      if (c.categoryId) countMap.set(c.categoryId, c.count);
    });

    return catList.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      gender: cat.gender,
      description: cat.description,
      isActive: cat.isActive,
      productCount: countMap.get(cat.id) || 0,
      createdAt: cat.createdAt,
    }));
  }

  /**
   * Safeguarded Category Deletion.
   * Prevents deleting a category if any products are assigned to it.
   */
  public static async deleteCategorySafely(categoryId: number): Promise<void> {
    const [assigned] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.categoryId, categoryId));

    if (assigned && assigned.count > 0) {
      throw new Error(
        `Cannot delete category: ${assigned.count} product(s) are currently assigned to it. Please reassign or delete the products first.`
      );
    }

    await db.delete(categories).where(eq(categories.id, categoryId));
  }

  /**
   * Retrieves all orders for the admin management view.
   */
  public static async getOrders(params?: {
    status?: "PENDING" | "CONFIRMED" | "CANCELLED";
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    search?: string;
  }) {
    const conditions = [];

    if (params?.status) {
      conditions.push(eq(orders.status, params.status));
    }

    if (params?.paymentStatus) {
      conditions.push(eq(orders.paymentStatus, params.paymentStatus));
    }

    if (params?.search && params.search.trim()) {
      const q = `%${params.search.trim()}%`;
      conditions.push(or(ilike(orders.orderNumber, q), ilike(orders.couponCode, q)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db.query.orders.findMany({
      where: whereClause,
      orderBy: [desc(orders.createdAt)],
      with: {
        user: true,
        items: true,
      },
    });

    return list.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      customerName: o.user?.name || "Customer",
      customerEmail: o.user?.email || "customer@example.com",
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentId: o.paymentId,
      subtotal: parseFloat(o.subtotal),
      discount: parseFloat(o.discount),
      total: parseFloat(o.total),
      couponCode: o.couponCode,
      createdAt: o.createdAt,
      itemCount: o.items?.length || 0,
      items: o.items.map((i: any) => ({
        id: i.id,
        productName: i.productName,
        variantInfo: i.variantInfo,
        productImage: i.productImage,
        price: parseFloat(i.price),
        quantity: i.quantity,
        total: parseFloat(i.total),
      })),
    }));
  }

  /**
   * Retrieves detailed order receipt for admin inspection.
   */
  public static async getOrderDetails(orderNumber: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber.trim()),
      with: {
        user: true,
        items: true,
      },
    });

    if (!order) throw new Error("Order not found");

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        id: order.user?.id,
        name: order.user?.name,
        email: order.user?.email,
      },
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      razorpayOrderId: order.razorpayOrderId,
      subtotal: parseFloat(order.subtotal),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      couponCode: order.couponCode,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((i: any) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantInfo: i.variantInfo,
        productImage: i.productImage,
        price: parseFloat(i.price),
        quantity: i.quantity,
        total: parseFloat(i.total),
      })),
    };
  }

  /**
   * Updates order status and/or payment status with inventory restoration / deduction safeguards.
   */
  public static async updateOrderStatus(
    orderNumber: string,
    data: {
      status?: "PENDING" | "CONFIRMED" | "CANCELLED";
      paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    }
  ) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber.trim()),
      with: {
        items: true,
      },
    });

    if (!order) throw new Error("Order not found");

    const previousStatus = order.status;
    const newStatus = data.status;

    // Inventory handling
    if (newStatus && newStatus !== previousStatus) {
      // 1. If transitioning to CANCELLED from CONFIRMED, restore inventory
      if (newStatus === "CANCELLED" && previousStatus === "CONFIRMED") {
        for (const item of order.items) {
          await db
            .update(inventory)
            .set({
              quantity: sql`${inventory.quantity} + ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(inventory.variantId, item.variantId));
        }
      }

      // 2. If transitioning from PENDING to CONFIRMED, verify & deduct inventory
      if (newStatus === "CONFIRMED" && previousStatus === "PENDING") {
        for (const item of order.items) {
          await db
            .update(inventory)
            .set({
              quantity: sql`GREATEST(0, ${inventory.quantity} - ${item.quantity})`,
              updatedAt: new Date(),
            })
            .where(eq(inventory.variantId, item.variantId));
        }
      }
    }

    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (data.status) updateFields.status = data.status;
    if (data.paymentStatus) updateFields.paymentStatus = data.paymentStatus;

    await db.update(orders).set(updateFields).where(eq(orders.id, order.id));

    return await this.getOrderDetails(orderNumber);
  }

  /**
   * Retrieves customers list with order count and total spend.
   * Excludes password hashes.
   */
  public static async getCustomers(): Promise<AdminCustomerItem[]> {
    const customerUsers = await db.query.users.findMany({
      where: eq(users.role, "CUSTOMER"),
      orderBy: [desc(users.createdAt)],
    });

    const userOrders = await db
      .select({
        userId: orders.userId,
        orderCount: sql<number>`count(*)::int`,
        totalSpent: sql<string>`coalesce(sum(case when payment_status = 'PAID' or status = 'CONFIRMED' then total::numeric else 0 end), 0)`,
      })
      .from(orders)
      .groupBy(orders.userId);

    const statsMap = new Map<number, { orderCount: number; totalSpent: number }>();
    userOrders.forEach((uo) => {
      statsMap.set(uo.userId, {
        orderCount: uo.orderCount,
        totalSpent: parseFloat(uo.totalSpent),
      });
    });

    return customerUsers.map((u) => {
      const stats = statsMap.get(u.id) || { orderCount: 0, totalSpent: 0 };
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
        createdAt: u.createdAt,
      };
    });
  }

  /**
   * Toggle customer active/suspended status.
   */
  public static async toggleCustomerStatus(userId: number): Promise<boolean> {
    const [user] = await db
      .select({ isActive: users.isActive, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new Error("Customer not found");
    if (user.role === "ADMIN") throw new Error("Admin accounts cannot be deactivated via this action.");

    const newStatus = !user.isActive;
    await db
      .update(users)
      .set({ isActive: newStatus, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return newStatus;
  }

  /**
   * Retrieves all promotional coupons.
   */
  public static async getCoupons() {
    return await db.query.coupons.findMany({
      orderBy: [desc(coupons.createdAt)],
    });
  }

  /**
   * Creates a promotional coupon.
   */
  public static async createCoupon(data: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minOrderAmount?: number;
    expiresAt?: Date | null;
    isActive?: boolean;
  }) {
    const existing = await db
      .select({ id: coupons.id })
      .from(coupons)
      .where(eq(coupons.code, data.code.toUpperCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`Coupon with code '${data.code.toUpperCase()}' already exists.`);
    }

    const [created] = await db
      .insert(coupons)
      .values({
        code: data.code.toUpperCase().trim(),
        discountType: data.discountType,
        discountValue: data.discountValue.toString(),
        minOrderAmount: (data.minOrderAmount ?? 0).toString(),
        expiresAt: data.expiresAt ?? null,
        isActive: data.isActive ?? true,
      })
      .returning();

    return created;
  }

  /**
   * Updates an existing coupon.
   */
  public static async updateCoupon(
    id: number,
    data: {
      code?: string;
      discountType?: "PERCENTAGE" | "FIXED";
      discountValue?: number;
      minOrderAmount?: number;
      expiresAt?: Date | null;
      isActive?: boolean;
    }
  ) {
    const payload: any = {};

    if (data.code) payload.code = data.code.toUpperCase().trim();
    if (data.discountType) payload.discountType = data.discountType;
    if (data.discountValue !== undefined) payload.discountValue = data.discountValue.toString();
    if (data.minOrderAmount !== undefined) payload.minOrderAmount = data.minOrderAmount.toString();
    if (data.expiresAt !== undefined) payload.expiresAt = data.expiresAt;
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    const [updated] = await db
      .update(coupons)
      .set(payload)
      .where(eq(coupons.id, id))
      .returning();

    if (!updated) throw new Error("Coupon not found");
    return updated;
  }

  /**
   * Deletes a coupon by ID.
   */
  public static async deleteCoupon(id: number): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }
}
