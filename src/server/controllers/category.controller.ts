import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { CategoryQueryParams } from "../validations/category.validation";

/**
 * Controller for Categories
 */
export class CategoryController {
  /**
   * GET /api/categories
   */
  public static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoryService.getAllCategories(req.query as unknown as CategoryQueryParams);
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/categories/:id
   */
  public static async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid category ID provided" });
        return;
      }

      const category = await CategoryService.getCategoryById(id);
      if (!category) {
        res.status(404).json({ success: false, message: `Category with ID ${id} not found` });
        return;
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/categories (Dev Admin API)
   */
  public static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.body);
      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/categories/:id (Dev Admin API)
   */
  public static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid category ID provided" });
        return;
      }

      const updated = await CategoryService.updateCategory(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: `Category with ID ${id} not found` });
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
   * DELETE /api/categories/:id (Dev Admin API)
   */
  public static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid category ID provided" });
        return;
      }

      const result = await CategoryService.deleteCategory(id);
      if (!result.success) {
        const statusCode = result.message.includes("not found") ? 404 : 400;
        res.status(statusCode).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
