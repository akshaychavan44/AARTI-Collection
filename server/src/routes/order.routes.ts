import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createOrderSchema, cancelOrderSchema } from "../validations/order.validation";

const router = Router();

// All order endpoints require active authenticated user
router.use(requireAuth);

// POST /api/orders - Initiate order from cart
router.post("/", validate(createOrderSchema, "body"), OrderController.createOrder);

// GET /api/orders - Get user's order history
router.get("/", OrderController.getUserOrders);

// GET /api/orders/:orderNumber - Get single order details
router.get("/:orderNumber", OrderController.getOrderByNumber);

// POST /api/orders/:orderNumber/cancel - Cancel eligible order
router.post("/:orderNumber/cancel", validate(cancelOrderSchema, "body"), OrderController.cancelOrder);

export default router;
