import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { ProductService } from "../services/product.service";
import { CategoryService } from "../services/category.service";

export class AdminController {
  /**
   * GET /api/admin/stats
   */
  public static async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/products
   */
  public static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      const status = req.query.status as "all" | "active" | "inactive" | undefined;

      const productsList = await AdminService.getProducts({ search, categoryId, status });
      res.status(200).json({
        success: true,
        data: productsList,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/products/:id
   */
  public static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await ProductService.getProductById(id);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/products
   */
  public static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await ProductService.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: created,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to create product" });
    }
  }

  /**
   * PUT /api/admin/products/:id
   */
  public static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await ProductService.updateProduct(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to update product" });
    }
  }

  /**
   * DELETE /api/admin/products/:id
   */
  public static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await AdminService.deleteProductSafely(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/products/:id/status
   */
  public static async toggleProductStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const newStatus = await AdminService.toggleProductStatus(id);
      res.status(200).json({
        success: true,
        message: `Product is now ${newStatus ? "active" : "inactive"}`,
        data: { isActive: newStatus },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to toggle product status" });
    }
  }

  /**
   * GET /api/admin/categories
   */
  public static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoriesList = await AdminService.getCategoriesWithCounts();
      res.status(200).json({
        success: true,
        data: categoriesList,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/categories
   */
  public static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to create category" });
    }
  }

  /**
   * PUT /api/admin/categories/:id
   */
  public static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await CategoryService.updateCategory(id, req.body);
      if (!category) {
        res.status(404).json({ success: false, message: "Category not found" });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to update category" });
    }
  }

  /**
   * DELETE /api/admin/categories/:id
   */
  public static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await AdminService.deleteCategorySafely(id);
      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to delete category" });
    }
  }

  /**
   * GET /api/admin/orders
   */
  public static async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as any;
      const paymentStatus = req.query.paymentStatus as any;
      const search = req.query.search as string | undefined;

      const ordersList = await AdminService.getOrders({ status, paymentStatus, search });
      res.status(200).json({
        success: true,
        data: ordersList,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/orders/:orderNumber
   */
  public static async getOrderDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await AdminService.getOrderDetails(req.params.orderNumber);
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || "Order not found" });
    }
  }

  /**
   * PATCH /api/admin/orders/:orderNumber/status
   */
  public static async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await AdminService.updateOrderStatus(req.params.orderNumber, req.body);
      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to update order status" });
    }
  }

  /**
   * GET /api/admin/customers
   */
  public static async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customersList = await AdminService.getCustomers();
      res.status(200).json({
        success: true,
        data: customersList,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/customers/:id/status
   */
  public static async toggleCustomerStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const newStatus = await AdminService.toggleCustomerStatus(id);
      res.status(200).json({
        success: true,
        message: `Customer account is now ${newStatus ? "active" : "suspended"}`,
        data: { isActive: newStatus },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to update customer status" });
    }
  }

  /**
   * GET /api/admin/coupons
   */
  public static async getCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const couponsList = await AdminService.getCoupons();
      res.status(200).json({
        success: true,
        data: couponsList,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/coupons
   */
  public static async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await AdminService.createCoupon(req.body);
      res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        data: coupon,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to create coupon" });
    }
  }

  /**
   * PUT /api/admin/coupons/:id
   */
  public static async updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const coupon = await AdminService.updateCoupon(id, req.body);
      res.status(200).json({
        success: true,
        message: "Coupon updated successfully",
        data: coupon,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to update coupon" });
    }
  }

  /**
   * DELETE /api/admin/coupons/:id
   */
  public static async deleteCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await AdminService.deleteCoupon(id);
      res.status(200).json({
        success: true,
        message: "Coupon deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
