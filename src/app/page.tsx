import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Heart,
  Sparkles,
  Star,
  ShieldCheck,
  ShoppingBag,
  MessageCircle,
  Check,
  Smile,
  BadgePercent,
  MapPin,
} from "lucide-react";
import { STORE_WHATSAPP_NUMBER } from "@/config/whatsapp";

const categories = [
  {
    title: "Boys Collection",
    subtitle: "Crisp shirts, rugged denims & everyday tees",
    href: "/products?gender=BOYS",
    image: "/images/products/boys-stretch-denim-jeans.jpg",
    color: "bg-[#a8d8ea]/40",
    badge: "Ages 2–16Y",
  },
  {
    title: "Girls Frocks & Sets",
    subtitle: "Breezy dresses, twirl frocks & pastel sets",
    href: "/products?gender=GIRLS",
    image: "/images/products/girls-floral-party-frock.jpg",
    color: "bg-[#f4a7b9]/40",
    badge: "Trending Now",
  },
  {
    title: "Infants & Toddlers",
    subtitle: "Ultra-soft rompers & organic onesies",
    href: "/products?ageGroup=0-2",
    image: "/images/products/baby-cotton-romper-suit.jpg",
    color: "bg-[#facc15]/40",
    badge: "0–2 Years",
  },
  {
    title: "Festive & Party Wear",
    subtitle: "Sparkling lehengas, kurtas & wedding sets",
    href: "/products?search=Festive",
    image: "/images/products/girls-foil-print-lehenga.jpg",
    color: "bg-[#c084fc]/30",
    badge: "Occasion Edit",
  },
];

const bestsellers = [
  {
    id: 1,
    name: "Pure Combed Cotton Graphic Play Tee",
    price: 499,
    compareAtPrice: 699,
    discount: "28% OFF",
    category: "Boys T-Shirts",
    image: "/images/products/boys-dino-tee.jpg",
    rating: 5,
    tag: "Bestseller",
    slug: "boys-dinosaur-printed-cotton-t-shirt",
  },
  {
    id: 2,
    name: "Pastel Peach Tiered Party Frock",
    price: 999,
    compareAtPrice: 1499,
    discount: "33% OFF",
    category: "Girls Frocks",
    image: "/images/products/girls-floral-party-frock.jpg",
    rating: 5,
    tag: "Customer Favorite",
    slug: "girls-floral-layered-party-frock",
  },
  {
    id: 3,
    name: "Organic Newborn Essentials Romper",
    price: 399,
    compareAtPrice: 599,
    discount: "33% OFF",
    category: "Infants 0–2Y",
    image: "/images/products/baby-cotton-romper-suit.jpg",
    rating: 5,
    tag: "Organic Cotton",
    slug: "baby-boys-organic-cotton-romper-suit",
  },
  {
    id: 4,
    name: "Celebration Royal Blue Kurta Pajama Set",
    price: 1499,
    compareAtPrice: 1999,
    discount: "25% OFF",
    category: "Festive Edit",
    image: "/images/products/boys-silk-kurta-pajama.jpg",
    rating: 5,
    tag: "Festive Star",
    slug: "boys-traditional-silk-blend-kurta-pajama-set",
  },
];

export default function Home() {
  const conciergeUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello! I would like help choosing an outfit for my child."
  )}`;

  return (
    <div className="bg-[#fffdfa] text-[#1e1e24] overflow-hidden">
      {/* 1. HERO SECTION - Inspired by Doodle by Canvas */}
      <section className="relative overflow-hidden border-b border-[#1e1e24]/10 bg-[#fffbf2]">
        {/* Subtle Doodle Grid Background */}
        <div className="absolute inset-0 bg-doodle-grid opacity-60 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f6efe2] border border-[#1e1e24]/10 text-xs font-semibold text-[#1e1e24] shadow-subtle">
                <span className="h-2 w-2 rounded-full bg-[#ff7849] animate-pulse" />
                <span>Aarti Collection</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1e1e24] leading-[1.05]">
                Comfortable Clothes for <br />
                <span className="relative inline-block text-[#ff7849]">
                  Everyday Play & Parties.
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-[#facc15]"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 9.5C50 2 150 2 198 9.5"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#1e1e24]/75 max-w-xl leading-relaxed">
                Durable, soft cotton clothes crafted for growing boys and girls. Perfect for school, playground fun, family gatherings, and festivals.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/products"
                  prefetch={true}
                  className="btn-bouncy inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#ff7849] hover:bg-[#ff7849]/90 text-[#1e1e24] font-bold text-sm shadow-card hover:shadow-card-hover"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop All Clothes</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <a
                  href={conciergeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bouncy inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#f6efe2] border border-[#1e1e24]/15 text-[#1e1e24] font-bold text-sm shadow-subtle"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Inquiries</span>
                </a>
              </div>

              {/* Trust Pill Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1e1e24]/10 text-xs font-semibold text-[#1e1e24] shadow-subtle">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Pure Breathable Cotton
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1e1e24]/10 text-xs font-semibold text-[#1e1e24] shadow-subtle">
                  <Smile className="w-3.5 h-3.5 text-amber-500" /> Sized for Ages 0–16
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1e1e24]/10 text-xs font-semibold text-[#1e1e24] shadow-subtle">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Store Pickup & Fast Delivery
                </span>
              </div>
            </div>

            {/* Right Outfit Showcase Card with Doodle Badges */}
            <div className="lg:col-span-5 relative">
              {/* Decorative pastel background blobs */}
              <div className="absolute -top-4 -right-4 w-48 h-48 rounded-3xl bg-[#facc15]/30 -rotate-6 pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-44 h-44 rounded-3xl bg-[#a8d8ea]/30 rotate-6 pointer-events-none" />

              {/* Main Showcase Frame */}
              <div className="relative rounded-3xl bg-white p-4 sm:p-5 border border-[#1e1e24]/10 shadow-card">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#f6efe2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=90&w=1100"
                    alt="Joyful child dressed in premium boutique clothing"
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e24]/60 via-transparent to-transparent" />

                  {/* Floating Doodle Badge Top Right */}
                  <div className="absolute top-4 right-4 animate-doodle-float">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#facc15] text-[#1e1e24] text-xs font-extrabold shadow-card rotate-3">
                      <Sparkles className="w-3.5 h-3.5" /> 100% Kid Approved
                    </span>
                  </div>

                  {/* Floating Badge Bottom Left */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#facc15]">
                        The Festive Edit
                      </span>
                      <h3 className="text-xl font-extrabold leading-tight">
                        Signature Celebration Frock
                      </h3>
                      <p className="text-xs text-white/80 mt-0.5">
                        Pure comfort • Premium lining
                      </p>
                    </div>

                    <Link
                      href="/products?gender=GIRLS"
                      className="px-3.5 py-2 rounded-full bg-white text-[#1e1e24] text-xs font-bold shadow-card hover:bg-[#ff7849] hover:text-[#1e1e24] transition-colors shrink-0"
                    >
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY DEPARTMENT / CATEGORY LANES */}
      <section className="py-16 sm:py-20 bg-[#fffdfa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff7849]">
                Collections
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e1e24] tracking-tight mt-1">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/products"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1e1e24] hover:text-[#ff7849] transition-colors"
            >
              <span>View all collections</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                prefetch={true}
                className="doodle-sticker group rounded-3xl bg-white border border-[#1e1e24]/10 overflow-hidden shadow-subtle flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f6efe2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-extrabold text-[#1e1e24] shadow-subtle">
                      {cat.badge}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1e1e24] group-hover:text-[#ff7849] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-[#1e1e24]/65 mt-1 leading-relaxed">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#1e1e24]/5">
                    <span className="text-xs font-bold text-[#ff7849]">Browse Outfits</span>
                    <span className="w-8 h-8 rounded-full bg-[#f6efe2] group-hover:bg-[#ff7849] group-hover:text-[#1e1e24] flex items-center justify-center transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SHOP BY AGE */}
      <section className="py-14 bg-[#fffbf2] border-y border-[#1e1e24]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff7849]">
              Age Filter
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e1e24] tracking-tight mt-1">
              Shop by Age Group
            </h2>
            <p className="text-xs sm:text-sm text-[#1e1e24]/70 mt-1">
              Perfect fitting clothes for every age from newborn to teenagers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {[
              { age: "0–2", label: "Infants", query: "0-2" },
              { age: "3–5", label: "Toddlers", query: "3-5" },
              { age: "6–9", label: "Little Kids", query: "6-9" },
              { age: "10–13", label: "Pre-Teens", query: "10-13" },
              { age: "14–16", label: "Teens", query: "14-16" },
            ].map((slot) => (
              <Link
                key={slot.age}
                href={`/products?ageGroup=${slot.query}`}
                prefetch={true}
                className="doodle-sticker p-4 rounded-2xl bg-white border border-[#1e1e24]/10 text-center shadow-subtle group hover:border-[#ff7849]"
              >
                <div className="text-2xl font-black text-[#1e1e24] group-hover:text-[#ff7849] transition-colors">
                  {slot.age}
                </div>
                <div className="text-[11px] font-bold uppercase text-[#1e1e24]/50 mt-0.5">
                  Years
                </div>
                <div className="text-xs text-[#1e1e24]/70 mt-1 font-medium">
                  {slot.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BESTSELLERS GRID */}
      <section className="py-16 sm:py-20 bg-[#fffdfa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff7849]">
                Parent Favorites
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e1e24] tracking-tight mt-1">
                Bestselling Picks
              </h2>
            </div>
            <Link
              href="/products"
              prefetch={true}
              className="btn-bouncy inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f6efe2] hover:bg-[#ff7849] hover:text-[#1e1e24] text-xs font-bold transition-all shadow-subtle"
            >
              <span>Explore All Garments</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((item) => {
              const whatsappItemUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hello! I would like to order or check sizes for "${item.name}" (₹${item.price}).`
              )}`;

              return (
                <div
                  key={item.id}
                  className="doodle-sticker rounded-3xl bg-white border border-[#1e1e24]/10 overflow-hidden shadow-subtle flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f6efe2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />

                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#ff7849] text-[#1e1e24] text-[10px] font-black uppercase tracking-wider shadow-subtle">
                        {item.tag}
                      </span>
                    </div>

                    {/* Discount Pill */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#22c55e] text-white text-[10px] font-extrabold">
                        {item.discount}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 mb-1.5">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>

                      <span className="text-[11px] font-bold uppercase text-[#1e1e24]/50">
                        {item.category}
                      </span>

                      <h3 className="text-sm font-extrabold text-[#1e1e24] mt-0.5 line-clamp-2">
                        {item.name}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1e1e24]/5 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-[#1e1e24]">
                          ₹{item.price}
                        </span>
                        <span className="text-xs text-[#1e1e24]/40 line-through">
                          ₹{item.compareAtPrice}
                        </span>
                      </div>

                      <a
                        href={whatsappItemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Inquire on WhatsApp"
                        className="p-2 rounded-full bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-emerald-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. REAL REVIEWS FROM HAPPY PARENTS */}
      <section className="py-16 sm:py-20 bg-[#fffbf2] border-t border-[#1e1e24]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff7849]">
              Verified Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e1e24] tracking-tight mt-1">
              Loved by Families
            </h2>
            <p className="text-xs sm:text-sm text-[#1e1e24]/70 mt-1">
              Real reviews from moms and dads in Kalyan and across India who trust us with their little ones’ outfits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "The quality of the cotton is amazing. It survives all our park playdates and washes without fading or shrinking. Best kids store in Kalyan!",
                author: "Pooja Deshmukh",
                location: "Kalyan West",
                stars: 5,
              },
              {
                quote:
                  "We bought the festive lehenga set for Diwali. Beautiful stitching and soft inner lining so my daughter was super comfortable the whole evening.",
                author: "Snehal & Rajesh Iyer",
                location: "Thane",
                stars: 5,
              },
              {
                quote:
                  "Ordered on WhatsApp and got same-day store pickup in Kalyan. Great concierge styling support and lovely personalized customer care.",
                author: "Ananya Mehta",
                location: "Kalyan East",
                stars: 5,
              },
            ].map((review) => (
              <div
                key={review.author}
                className="doodle-sticker p-6 rounded-3xl bg-white border border-[#1e1e24]/10 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-500 mb-3">
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-[#1e1e24]/85 leading-relaxed">
                    “{review.quote}”
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1e1e24]/10 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#1e1e24]">{review.author}</span>
                  <span className="text-[#1e1e24]/50">{review.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BOUTIQUE CONCIERGE CALLOUT BANNER */}
      <section className="py-14 bg-[#1e1e24] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#facc15]/20 text-[#facc15] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Need Sizing Advice?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Chat Directly with Aarti Collection Stylist
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto">
            Not sure about the size or fabric? Message us directly on WhatsApp for personalized styling and sizing advice.
          </p>
          <div className="pt-2">
            <a
              href={conciergeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-bouncy inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-bold text-sm shadow-card"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message on WhatsApp (+91 72088 30380)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
