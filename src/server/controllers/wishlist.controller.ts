import { Request, Response, NextFunction } from "express";
import { WishlistService } from "../services/wishlist.service";

export class WishlistController {
  /**
   * GET /api/wishlist
   * Returns current user's bookmarked products.
   */
  public static async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const wishlist = await WishlistService.getWishlist(userId);

      res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/wishlist
   * Adds a product to user's wishlist.
   */
  public static async addToWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { productId } = req.body;

      const wishlist = await WishlistService.addItem(userId, productId);

      res.status(200).json({
        success: true,
        message: "Product added to wishlist",
        data: wishlist,
      });
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("inactive")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/wishlist/:productId
   * Removes a product from user's wishlist.
   */
  public static async removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.productId, 10);

      if (isNaN(productId) || productId <= 0) {
        res.status(400).json({ success: false, message: "Invalid product ID" });
        return;
      }

      const wishlist = await WishlistService.removeItem(userId, productId);

      res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/wishlist/:productId/move-to-cart
   * Moves product from wishlist into user's cart.
   */
  public static async moveToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.productId, 10);
      const { variantId } = req.body || {};

      if (isNaN(productId) || productId <= 0) {
        res.status(400).json({ success: false, message: "Invalid product ID" });
        return;
      }

      const result = await WishlistService.moveToCart(userId, productId, variantId);

      res.status(200).json({
        success: true,
        message: "Product moved to cart successfully",
        data: result,
      });
    } catch (error: any) {
      if (error.message?.includes("stock") || error.message?.includes("not found")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
}
