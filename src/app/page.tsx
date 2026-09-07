import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Users,
  CheckCircle2,
  Truck,
  MessageCircle,
  Star,
  Layers,
  Clock,
  Compass,
} from "lucide-react";
import { STORE_WHATSAPP_NUMBER } from "@/config/whatsapp";

export default function Home() {
  const conciergeUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Kalyan Kids Atelier! I would like recommendations for my child's outfit."
  )}`;

  const ageGroups = [
    {
      range: "0-2",
      title: "Newborn & Toddler",
      label: "Ages 0–2",
      tagline: "Ultra-soft gentle cottons & cozy rompers",
      bgGradient: "from-rose-500/10 via-pink-500/5 to-transparent",
      accent: "text-rose-600 bg-rose-50 border-rose-200",
      image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&q=80&w=600",
    },
    {
      range: "3-5",
      title: "Preschool Charm",
      label: "Ages 3–5",
      tagline: "Twirl frocks, party dresses & playful shirts",
      bgGradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
      accent: "text-amber-600 bg-amber-50 border-amber-200",
      image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=600",
    },
    {
      range: "6-9",
      title: "Junior Trendsetters",
      label: "Ages 6–9",
      tagline: "Modern polos, comfortable denims & skirts",
      bgGradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
      accent: "text-blue-600 bg-blue-50 border-blue-200",
      image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=80&w=600",
    },
    {
      range: "10-13",
      title: "Pre-Teen Couture",
      label: "Ages 10–13",
      tagline: "Sharp coordinates, festive wear & chic jackets",
      bgGradient: "from-purple-500/10 via-fuchsia-500/5 to-transparent",
      accent: "text-purple-600 bg-purple-50 border-purple-200",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=600",
    },
    {
      range: "14-16",
      title: "Young Elegance",
      label: "Ages 14–16",
      tagline: "Tailored blazers, wedding sets & statement looks",
      bgGradient: "from-slate-500/10 via-zinc-500/5 to-transparent",
      accent: "text-slate-700 bg-slate-100 border-slate-300",
      image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&q=80&w=600",
    },
  ];

  const curatedCollections = [
    {
      title: "Girls Royal Frocks & Gowns",
      subtitle: "Soft breathable lining, fairy laces & twirl-tested hems",
      href: "/products?gender=GIRLS",
      tag: "Princess Collection",
      image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Boys Gentleman Wear",
      subtitle: "Pure cotton shirts, tailored trousers & smart co-ord sets",
      href: "/products?gender=BOYS",
      tag: "Gentleman Edition",
      image: "https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Festive Lehengas & Kurta Sets",
      subtitle: "Intricate zari work with kid-safe zero-itch inner cotton linings",
      href: "/products?search=Festive",
      tag: "Indian Heritage",
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const parentReviews = [
    {
      name: "Pooja Deshmukh",
      location: "Khadakpada, Kalyan West",
      rating: 5,
      review:
        "The fabric quality is unlike any other store in Kalyan! My 4-year-old daughter wore her pink frock for 6 hours straight without scratching or crying. The WhatsApp ordering made size confirmation effortless.",
    },
    {
      name: "Rajesh Iyer",
      location: "Wayle Nagar, Kalyan",
      rating: 5,
      review:
        "Bought a festival kurta set for my 8-year-old son. Soft inner lining, rich look, and delivered to our doorstep the very same evening. 10/10 recommended for Kalyan parents!",
    },
    {
      name: "Anjali Kulkarni",
      location: "Godrej Hill, Kalyan",
      rating: 5,
      review:
        "Finally, a truly luxury kids brand locally available in Kalyan. Prices are so reasonable for this level of organic cotton finish and durability after multiple machine washes.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9]">
      {/* Editorial Luxury Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-radial-hero">
        {/* Subtle Decorative Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-rose-200/80 shadow-xs backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-rose-700 to-amber-700 bg-clip-text text-transparent">
                  Kalyan&apos;s Flagship Kids Haute Boutique • Ages 0–16
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
                Where Little Dreams Meet{" "}
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent font-serif italic">
                  Timeless Elegance
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Impeccably tailored kids clothing crafted with hypoallergenic pure organic cottons, gentle dyes, and celebratory charm. Designed specifically for Kalyan&apos;s active boys and girls.
              </p>

              {/* Action Buttons Cluster */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 group"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:rotate-6 transition-transform" />
                  <span>Explore 2026 Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href={conciergeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-sm border border-emerald-200 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Stylist</span>
                </a>
              </div>

              {/* Gender Wardrobe Quick Pills */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/products?gender=BOYS"
                  className="px-5 py-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>👦 Boys Wear</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/products?gender=GIRLS"
                  className="px-5 py-2.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>👧 Girls Wear</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Luxury Guarantee Micro-Badges */}
              <div className="pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-4 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">100% Skin-Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">Kalyan Express</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">Authoritative Stock</span>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Visual Showcase with 3D Depth Card */}
            <div className="lg:col-span-5 relative perspective-1000">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white card-3d aspect-4/5 max-w-md mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=900"
                  alt="Kalyan Kids Luxury Fashion"
                  className="w-full h-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/10" />

                {/* Floating 3D Badge (Top Right) */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-white/60">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    New 2026 Edition
                  </span>
                </div>

                {/* Floating Bottom Card */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/60 shadow-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-rose-600">
                      Bespoke Frocks & Suits
                    </span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4.9 / 5
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">
                    Hand-Selected Fabrics for Maximum Joy
                  </h4>
                  <p className="text-xs text-slate-500">
                    Sizes 0 Months to 16 Years Available in Kalyan Store
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Age Explorer Section */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>Tailored by Growth Milestones</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Explore by Child&apos;s Age
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Precision sizing made effortless. Choose your little one&apos;s age category to discover perfectly fitted dresses, outfits, and sets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {ageGroups.map((group) => (
              <Link
                key={group.range}
                href={`/products?ageGroup=${group.range}`}
                className="group relative rounded-3xl overflow-hidden border border-slate-200/80 hover:border-rose-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col bg-white card-3d"
              >
                {/* Image Header */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={group.image}
                    alt={group.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className={`absolute top-3 left-3 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs ${group.accent}`}>
                    {group.label}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
                      {group.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {group.tagline}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-rose-600">
                    <span>View Wardrobe</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Haute Collections Showcase */}
      <section className="py-20 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
                Signature Lines
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Curated Haute Collections
              </h2>
              <p className="text-slate-600 text-sm max-w-xl">
                Boutique designs handpicked for celebrations, parties, and daily luxury wear.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-rose-600 hover:text-rose-700 group"
            >
              <span>View Full Lookbook</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {curatedCollections.map((col) => (
              <Link
                key={col.title}
                href={col.href}
                className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 card-3d aspect-3/4 flex flex-col justify-end p-6 border border-slate-200/80"
              >
                {/* Background Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={col.image}
                  alt={col.title}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-black/10 group-hover:via-slate-950/50 transition-colors" />

                {/* Floating Tag */}
                <div className="relative z-10 space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-white/90 text-slate-900 backdrop-blur-md">
                    {col.tag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-rose-200 transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {col.subtitle}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    <span>Shop Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The Atelier Promise (4 Pillars of Luxury) */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              The Kalyan Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Craftsmanship Without Compromise
            </h2>
            <p className="text-slate-600 text-sm">
              We design every seam with pure consideration for children&apos;s delicate skin and boundless energy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-rose-200 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Zero-Itch Stitching</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seamless inner joins, soft thread bindings, and flat woven tags prevent skin friction all day.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Authoritative Pricing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fair, transparent boutique pricing direct from makers with zero hidden markups.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Same-Day Kalyan Pickup</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Need an outfit for an urgent birthday party? Order online and collect immediately in Kalyan West.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">1-Click WhatsApp Support</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask about availability, exact size measurements, or customized gift packaging directly on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kalyan Parent Testimonials */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Loved by Kalyan Families
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real Stories from Local Parents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {parentReviews.map((rev) => (
              <div
                key={rev.name}
                className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    &ldquo;{rev.review}&rdquo;
                  </p>
                </div>
                <div className="border-t border-slate-700/60 pt-3">
                  <h4 className="text-sm font-bold text-white">{rev.name}</h4>
                  <p className="text-xs text-slate-400">{rev.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP WhatsApp Concierge Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/20 backdrop-blur-md">
                Personalized Service in Kalyan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Need Help Picking the Perfect Outfit or Size?
              </h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Our boutique stylists in Kalyan are live on WhatsApp (+91 72088 30380). Send us your child&apos;s age and event details, and we&apos;ll send curated photos instantly!
              </p>
            </div>

            <a
              href={conciergeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-sm shadow-2xl hover:shadow-emerald-950/40 transition-all flex items-center gap-2.5 shrink-0 hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>Chat on WhatsApp Now</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
