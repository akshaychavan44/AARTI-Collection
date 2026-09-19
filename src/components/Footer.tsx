"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  Store,
  Heart,
  MessageCircle,
} from "lucide-react";
import { STORE_WHATSAPP_NUMBER } from "@/config/whatsapp";

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Do not render consumer storefront footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Kalyan Kids Boutique! I would like personal styling assistance or have a question about kids fashion."
  )}`;

  return (
    <footer className="bg-[#1e1e24] text-[#fffdfa] relative overflow-hidden border-t border-[#1e1e24]/10">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff7849]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#facc15]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff7849] via-[#f4a7b9] to-[#facc15] flex items-center justify-center text-[#1e1e24] shadow-card group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white block">
                  Kalyan Kids
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#ff7849]">
                  Modern Playful Boutique (Ages 0–16)
                </span>
              </div>
            </Link>

            <p className="text-sm text-white/70 leading-relaxed max-w-md pt-1">
              Curating cheerful, authentic kids’ fashion in Kalyan. From celebratory festive lehengas and bandhgalas to ultra-soft everyday playwear, crafted for pure comfort and endless childhood adventures.
            </p>

            {/* Direct WhatsApp Concierge Button */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-bold text-xs shadow-card transition-all hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>WhatsApp Stylist: +91 72088 30380</span>
              </a>
            </div>
          </div>

          {/* Quick Collections */}
          <div>
            <h3 className="text-xs font-bold text-[#ff7849] uppercase tracking-wider mb-4 border-l-2 border-[#ff7849] pl-3">
              Collections
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link href="/products?gender=GIRLS" className="hover:text-white transition-colors">
                  Girls Frocks & Sets
                </Link>
              </li>
              <li>
                <Link href="/products?gender=BOYS" className="hover:text-white transition-colors">
                  Boys Shirts & Denims
                </Link>
              </li>
              <li>
                <Link href="/products?ageGroup=0-2" className="hover:text-white transition-colors">
                  Infants & Toddlers (0–2Y)
                </Link>
              </li>
              <li>
                <Link href="/products?ageGroup=3-5" className="hover:text-white transition-colors">
                  Preschoolers (3–5Y)
                </Link>
              </li>
              <li>
                <Link href="/products?ageGroup=6-9" className="hover:text-white transition-colors">
                  Junior Trendsetters (6–9Y)
                </Link>
              </li>
              <li>
                <Link href="/products?ageGroup=10-13" className="hover:text-white transition-colors">
                  Pre-Teens (10–13Y)
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-xs font-bold text-[#facc15] uppercase tracking-wider mb-4 border-l-2 border-[#facc15] pl-3">
              Help & Orders
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  My Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Track My Orders
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutique Visit Info */}
          <div>
            <h3 className="text-xs font-bold text-[#a8d8ea] uppercase tracking-wider mb-4 border-l-2 border-[#a8d8ea] pl-3">
              Kalyan Boutique
            </h3>
            <div className="space-y-3 text-xs text-white/70">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#ff7849] shrink-0 mt-0.5" />
                <span>Station Road / Khadakpada, Kalyan West, Maharashtra 421301</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#facc15] shrink-0" />
                <span>Mon–Sun: 10:00 AM – 9:30 PM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Support: +91 72088 30380</span>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/30">
                  ● Store Open Today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Kalyan Kids. All rights reserved. Thoughtfully crafted kids fashion.</p>
          <div className="flex items-center gap-4 text-white/60">
            <span>UPI • RuPay • NetBanking • Visa • Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
