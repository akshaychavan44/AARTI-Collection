/**
 * WhatsApp Configuration & Link Generator for Kalyan Kids
 * Standard WhatsApp Click-to-Chat protocol (wa.me)
 */

export interface WhatsAppProductDetails {
  productName: string;
  ageGroup?: string;
  price?: string | number;
  productCode?: string;
  color?: string;
  size?: string;
}

/**
 * Clean and format the shop owner WhatsApp number.
 * Removes any non-numeric characters (+, spaces, dashes) to ensure
 * reliable wa.me URL resolution on both desktop browsers and mobile apps.
 */
export function getShopWhatsAppNumber(): string {
  const envNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  // Use actual store number, filtering out any old cached placeholder
  const raw = (envNum && !envNum.includes("9876543210")) ? envNum : "917208830380";
  const cleaned = raw.replace(/[^0-9]/g, "");
  // If user provided a 10-digit Indian mobile number without country code, prepend 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Format a clean, human-friendly message for WhatsApp inquiry.
 *
 * Example:
 * "Hi! I'm interested in the Pink Party Dress for 3–5 years.
 *
 * Price: ₹799
 * Product Code: GD-102
 * Color: Rose Pink
 * Size: 3-4Y
 *
 * Is it available?"
 */
export function createProductWhatsAppMessage(details: WhatsAppProductDetails): string {
  const lines: string[] = [];

  // Greeting & Product with Age Group
  const ageSuffix = details.ageGroup ? ` for ${details.ageGroup} years` : "";
  lines.push(`Hi! I'm interested in the ${details.productName}${ageSuffix}.`);
  lines.push("");

  // Product Details
  if (details.price !== undefined && details.price !== null && details.price !== "") {
    lines.push(`Price: ₹${details.price}`);
  }

  if (details.productCode) {
    lines.push(`Product Code: ${details.productCode}`);
  }

  if (details.color) {
    lines.push(`Color: ${details.color}`);
  }

  if (details.size) {
    lines.push(`Size: ${details.size}`);
  }

  lines.push("");
  lines.push("Is it available?");

  return lines.join("\n");
}

/**
 * Generate a direct WhatsApp click-to-chat URL with the encoded message.
 */
export function getProductWhatsAppUrl(details: WhatsAppProductDetails): string {
  const cleanPhone = getShopWhatsAppNumber();
  const textMessage = createProductWhatsAppMessage(details);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`;
}
