"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Store,
  RotateCcw,
  Heart,
  MessageCircle,
} from "lucide-react";
import { STORE_WHATSAPP_NUMBER } from "@/config/whatsapp";

export const Footer: React.FC = () => {
  const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Kalyan Kids Atelier! I would like personal styling assistance or have a question about kids fashion."
  )}`;

  return (
    <footer className="bg-slate-950 text-slate-300 relative overflow-hidden border-t border-slate-800">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/30 border border-slate-750/50">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">Pure Organic Fabrics</h4>
                <p className="text-xs text-slate-400 mt-0.5">Gentle, hypoallergenic & breathable</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/30 border border-slate-750/50">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">In-Store Boutique Pickup</h4>
                <p className="text-xs text-slate-400 mt-0.5">Convenient pickup at Kalyan West shop</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/30 border border-slate-750/50">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">7-Day Easy Exchange</h4>
                <p className="text-xs text-slate-400 mt-0.5">Perfect fit guaranteed for every child</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/30 border border-slate-750/50">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">Authoritative Stock</h4>
                <p className="text-xs text-slate-400 mt-0.5">Live store inventory & verified quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white block">
                  Kalyan Kids <span className="text-rose-400 font-serif italic text-xl font-normal">Atelier</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-400">
                  Haute Couture & Daily Comfort (Ages 0–16)
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md pt-2">
              Curating India&apos;s finest kids fashion in Kalyan. From celebratory festive lehengas and bandhgalas to soft everyday organic cottons, crafted with playful spirit and refined tailoring.
            </p>

            {/* Direct WhatsApp Concierge Button */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-100" />
                <span>Personal Styling Concierge: +91 72088 30380</span>
              </a>
            </div>
          </div>

          {/* Quick Collections */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-3">
              Collections
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products?gender=GIRLS" className="hover:text-rose-400 transition-colors">
                  Girls Frocks & Gowns
                </Link>
              </li>
              <li>
                <Link href="/products?gender=BOYS" className="hover:text-rose-400 transition-colors">
                  Boys Shirts & Suits
                </Link>
              </li>
              <li>
                <Link href="/products?ageGroup=0-2" className="hover:text-rose-400 transition-colors">
                  Infants & Toddlers (0–2 Yrs)
                </Link>
              </li>
              <li>
                <Link href="/products?ageGroup=3-5" className="hover:text-rose-400 transition-colors">
                  Preschoolers (3–5 Yrs)
                </Link>
              </li>
              <li>
                <Link href="/products?ageGroup=6-9" className="hover:text-rose-400 transition-colors">
                  Junior Trendsetters (6–9 Yrs)
                </Link>
              </li>
              <li>
                <Link href="/products?ageGroup=10-13" className="hover:text-rose-400 transition-colors">
                  Pre-Teens (10–13 Yrs)
                </Link>
              </li>
              <li>
                <Link href="/products?ageGroup=14-16" className="hover:text-rose-400 transition-colors">
                  Teens Wardrobe (14–16 Yrs)
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Experience */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-3">
              Client Care
            </h3>
            <ul className="space-y-2.5 text-sm">
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
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-500 hover:text-amber-400 transition-colors text-xs">
                  Store Staff & Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutique Visit Info */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-pink-500 pl-3">
              Kalyan Boutique
            </h3>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Station Road / Khadakpada, Kalyan West, Maharashtra 421301</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Open Mon–Sun: 10:00 AM – 9:30 PM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Support: +91 72088 30380</span>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                  ● Store Open Today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Security */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Kalyan Kids Atelier. All rights reserved. Crafted with care for little royals.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>UPI • RuPay • NetBanking • Visa • COD Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
