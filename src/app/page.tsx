import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Heart, ShoppingBag, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Premium Kids Fashion in Kalyan (Ages 0 to 16)</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Dress Your Kids in{" "}
              <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 bg-clip-text text-transparent">
                Comfort & Joy
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              From everyday t-shirts and frocks to festive ethnic wear and lehengas. Designed specifically for Kalyan&apos;s active boys and girls.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Kids Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex gap-2 w-full sm:w-auto">
                <Link
                  href="/products?gender=BOYS"
                  className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-blue-600 font-bold text-sm border border-slate-200 shadow-xs transition-all flex items-center justify-center"
                >
                  Boys Wear
                </Link>
                <Link
                  href="/products?gender=GIRLS"
                  className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-rose-600 font-bold text-sm border border-slate-200 shadow-xs transition-all flex items-center justify-center"
                >
                  Girls Wear
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href="/products"
              className="p-6 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-100 hover:border-rose-200 transition-all flex flex-col items-start group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                Full Clothing Catalog
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Filter by age (0-2 to 14-16), size, color, brand, and stock with real-time server-side pagination.
              </p>
            </Link>

            <Link
              href="/wishlist"
              className="p-6 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-100 hover:border-rose-200 transition-all flex flex-col items-start group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                Personal Wishlist
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Bookmark favorite outfits, compare prices, and move directly to cart with a single click.
              </p>
            </Link>

            <Link
              href="/cart"
              className="p-6 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-100 hover:border-rose-200 transition-all flex flex-col items-start group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                Persistent Cart & Pickup
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Authoritative unit prices from PostgreSQL with live stock reservation and Kalyan local store pickup.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
