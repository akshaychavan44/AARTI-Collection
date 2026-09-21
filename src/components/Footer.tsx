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
    "Hello Aarti Collection! I would like personal styling assistance or have a question about kids fashion."
  )}`;

  return (
    <footer className="bg-stone-950 text-stone-300 relative overflow-hidden border-t border-stone-800">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-stone-800/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-white shadow-card group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white block">
                  Aarti Collection
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-stone-400">
                  Kids Clothing & Ethnic Wear (Ages 0–16)
                </span>
              </div>
            </Link>

            <p className="text-sm text-stone-400 leading-relaxed max-w-md pt-1">
              Cheerful, high-quality kids’ fashion from Aarti Collection. From celebratory festive lehengas and kurta sets to soft everyday playwear, crafted for comfort and childhood adventures.
            </p>

            {/* Direct WhatsApp Concierge Button */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-100 font-bold text-xs shadow-card transition-all hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Stylist: +91 72088 30380</span>
              </a>
            </div>
          </div>

          {/* Quick Collections */}
          <div>
            <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-4 border-l-2 border-stone-500 pl-3">
              Collections
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
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
            <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-4 border-l-2 border-stone-500 pl-3">
              Help & Orders
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
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
            <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-4 border-l-2 border-stone-500 pl-3">
              Store Location
            </h3>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                <span>Station Road / Khadakpada, Kalyan West, Maharashtra 421301</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-stone-300 shrink-0" />
                <span>Mon–Sun: 10:00 AM – 9:30 PM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Support: +91 72088 30380</span>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-stone-900 text-stone-300 text-[11px] font-semibold border border-stone-800">
                  ● Store Open Today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Aarti Collection. All rights reserved.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>UPI • RuPay • NetBanking • Visa • Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
