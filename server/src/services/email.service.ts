import { Resend } from "resend";
import { env } from "../config/env";
import { logger } from "../utils/logger";

let resendClient: Resend | null = null;
if (env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith("re_")) {
  resendClient = new Resend(env.RESEND_API_KEY);
}

export interface EmailOrderDetails {
  orderNumber: string;
  total: string | number;
  subtotal: string | number;
  discount: string | number;
  items: {
    productName: string;
    variantInfo: string;
    quantity: number;
    price: string | number;
    total: string | number;
  }[];
}

export class EmailService {
  /**
   * Sends an order confirmation email to the customer.
   * Gracefully logs if Resend API key is not configured or in test mode.
   */
  public static async sendOrderConfirmationEmail(
    order: EmailOrderDetails,
    customer: { name: string; email: string }
  ): Promise<boolean> {
    const subject = `Order Confirmed: #${order.orderNumber} - Kalyan Kids`;

    const itemsHtml = order.items
      .map(
        (i) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
            <strong>${i.productName}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">${i.variantInfo}</span>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: center;">${i.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: right;">₹${i.price}</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold;">₹${i.total}</td>
        </tr>`
      )
      .join("");

    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #e11d48; margin: 0; font-size: 24px;">Kalyan Kids Clothing</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Quality Kids Fashion in Kalyan</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Thank you for your order, ${customer.name}!</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            Your order has been confirmed and is being prepared for convenient store pickup at Kalyan.
          </p>
          <div style="display: flex; justify-content: space-between; margin-top: 16px; padding: 12px; background-color: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1;">
            <div>
              <span style="font-size: 12px; color: #64748b; display: block;">Order Number</span>
              <strong style="color: #e11d48; font-size: 16px;">#${order.orderNumber}</strong>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 12px; color: #64748b; display: block;">Total Paid</span>
              <strong style="color: #0f172a; font-size: 16px;">₹${order.total}</strong>
            </div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="padding: 8px;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; color: #64748b;">Subtotal:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">₹${order.subtotal}</td>
            </tr>
            ${
              Number(order.discount) > 0
                ? `<tr>
                    <td colspan="3" style="padding: 8px; text-align: right; color: #16a34a;">Discount:</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold; color: #16a34a;">-₹${order.discount}</td>
                  </tr>`
                : ""
            }
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold; font-size: 16px;">Grand Total:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 16px; color: #e11d48;">₹${order.total}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8;">
          <p>Kalyan Kids Store, Shivaji Chowk, Kalyan (W), Maharashtra</p>
          <p>Questions? Contact us or visit our Kalyan store anytime.</p>
        </div>
      </div>
    `;

    if (resendClient) {
      try {
        await resendClient.emails.send({
          from: env.RESEND_FROM_EMAIL || "orders@kalyankids.com",
          to: customer.email,
          subject,
          html: emailHtml,
        });
        logger.info(`📧 Order confirmation email sent to ${customer.email} for order #${order.orderNumber}`);
        return true;
      } catch (err: any) {
        logger.warn(`Failed to dispatch Resend email to ${customer.email}: ${err.message}`);
        return false;
      }
    } else {
      logger.info(
        `📧 [Resend Test Mode]: Order confirmation email queued for ${customer.email} (Order #${order.orderNumber}, Total: ₹${order.total})`
      );
      return true;
    }
  }
}
