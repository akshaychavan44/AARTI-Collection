import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";

export class OrderController {
  /**
   * POST /api/orders
   * Creates a PENDING order from customer's current cart with optional coupon.
   */
  public static async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { couponCode } = req.body;

      const order = await OrderService.createOrderFromCart(userId, couponCode);

      res.status(201).json({
        success: true,
        message: "Order initiated successfully",
        data: order,
      });
    } catch (error: any) {
      if (
        error.message?.includes("empty") ||
        error.message?.includes("stock") ||
        error.message?.includes("coupon")
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
   * GET /api/orders
   * Retrieves all orders for the authenticated user.
   */
  public static async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const userOrders = await OrderService.getUserOrders(userId);

      res.status(200).json({
        success: true,
        data: userOrders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:orderNumber
   * Retrieves single order details with ownership enforcement.
   */
  public static async getOrderByNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === "ADMIN";
      const { orderNumber } = req.params;

      const order = await OrderService.getOrderByNumber(orderNumber, userId, isAdmin);

      res.status(200).json({
        success: true,
        data: order,
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
   * POST /api/orders/:orderNumber/cancel
   * Cancels order and restores variant inventory.
   */
  public static async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === "ADMIN";
      const { orderNumber } = req.params;

      const order = await OrderService.cancelOrder(orderNumber, userId, isAdmin);

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      if (error.message?.includes("already")) {
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
