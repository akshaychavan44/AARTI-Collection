"use client";

import React from "react";
import {
  getProductWhatsAppUrl,
  WhatsAppProductDetails,
} from "@/config/whatsapp";

export interface WhatsAppButtonProps extends WhatsAppProductDetails {
  className?: string;
  variant?: "default" | "compact";
}

/**
 * Clean SVG WhatsApp Speech Bubble Icon (Kalyan Kids Store WhatsApp: +91 7208830380)
 */
function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.23-.17-.48-.29" />
    </svg>
  );
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  productName,
  ageGroup,
  price,
  productCode,
  color,
  size,
  className = "",
  variant = "default",
}) => {
  const whatsappUrl = getProductWhatsAppUrl({
    productName,
    ageGroup,
    price,
    productCode,
    color,
    size,
  });

  if (variant === "compact") {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Ask about this dress on WhatsApp"
        aria-label={`Ask about ${productName} on WhatsApp`}
        className={`inline-flex items-center justify-center p-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer ${className}`}
      >
        <WhatsAppIcon className="w-4 h-4" />
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ask about ${productName} on WhatsApp`}
      className={`inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-[#25D366]/20 hover:shadow-lg hover:shadow-[#25D366]/30 transition-all cursor-pointer ${className}`}
    >
      <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
      <span>💬 Ask on WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
