import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { ProductQueryParams } from "../validations/product.validation";

/**
 * Controller for Products
 */
export class ProductController {
  /**
   * GET /api/products
   * Supports filtering, search, and pagination.
   */
  public static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.getProducts(req.query as unknown as ProductQueryParams);
      res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   */
  public static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid product ID provided" });
        return;
      }

      const product = await ProductService.getProductById(id);
      if (!product) {
        res.status(404).json({ success: false, message: `Product with ID ${id} not found` });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/slug/:slug
   */
  public static async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      if (!slug || slug.trim().length === 0) {
        res.status(400).json({ success: false, message: "Valid slug is required" });
        return;
      }

      const product = await ProductService.getProductBySlug(slug.trim());
      if (!product) {
        res.status(404).json({ success: false, message: `Product with slug '${slug}' not found` });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products (Dev Admin API)
   */
  public static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newProduct = await ProductService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: newProduct,
      });
    } catch (error: any) {
      // Catch specific validation or duplicate errors cleanly
      if (error.message && (error.message.includes("SKU") || error.message.includes("Category with ID"))) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * PUT /api/products/:id (Dev Admin API)
   */
  public static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid product ID provided" });
        return;
      }

      const updated = await ProductService.updateProduct(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: `Product with ID ${id} not found` });
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id (Dev Admin API)
   */
  public static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid product ID provided" });
        return;
      }

      const deleted = await ProductService.deleteProduct(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: `Product with ID ${id} not found` });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
