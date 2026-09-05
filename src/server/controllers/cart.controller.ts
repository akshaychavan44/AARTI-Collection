import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service";

export class CartController {
  /**
   * GET /api/cart
   * Returns current user's cart with calculated totals and stock status.
   */
  public static async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const cart = await CartService.getCart(userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cart/items
   * Adds an item variant to cart or increments quantity.
   */
  public static async addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { productId, variantId, quantity } = req.body;

      const cart = await CartService.addItem(userId, productId, variantId, quantity || 1);

      res.status(200).json({
        success: true,
        message: "Item added to cart successfully",
        data: cart,
      });
    } catch (error: any) {
      if (
        error.message?.includes("stock") ||
        error.message?.includes("inactive") ||
        error.message?.includes("not found")
      ) {
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
   * PUT /api/cart/items/:id
   * Updates quantity for an existing cart item.
   */
  public static async updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const itemId = parseInt(req.params.id, 10);

      if (isNaN(itemId) || itemId <= 0) {
        res.status(400).json({ success: false, message: "Invalid cart item ID" });
        return;
      }

      const { quantity } = req.body;
      const cart = await CartService.updateQuantity(userId, itemId, quantity);

      res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: cart,
      });
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      if (error.message?.includes("stock")) {
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
   * DELETE /api/cart/items/:id
   * Removes an item from the user's cart.
   */
  public static async removeCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const itemId = parseInt(req.params.id, 10);

      if (isNaN(itemId) || itemId <= 0) {
        res.status(400).json({ success: false, message: "Invalid cart item ID" });
        return;
      }

      const cart = await CartService.removeItem(userId, itemId);

      res.status(200).json({
        success: true,
        message: "Item removed from cart",
        data: cart,
      });
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/cart
   * Clears the user's active cart.
   */
  public static async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const cart = await CartService.clearCart(userId);

      res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }
}
