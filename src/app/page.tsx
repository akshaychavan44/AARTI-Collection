"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Sparkles,
  Sun,
} from "lucide-react";
import { Reveal } from "@/components/Storefront";
import {
  ProductCard,
  ProductSkeleton,
  type StoreProduct,
} from "@/components/ProductCard";
import { api } from "@/lib/api";

const ages = [
  {
    age: "0–2",
    query: "0-2",
    label: "Tiny beginnings",
    image: "baby-cotton-romper-suit.jpg",
    color: "#f6e9dc",
  },
  {
    age: "3–5",
    query: "3-5",
    label: "Little explorers",
    image: "boys-dino-tee.jpg",
    color: "#e5eddf",
  },
  {
    age: "6–9",
    query: "6-9",
    label: "Big imaginations",
    image: "girls-floral-party-frock.jpg",
    color: "#f7e5e9",
  },
  {
    age: "10–13",
    query: "10-13",
    label: "Growing their style",
    image: "teen-boy-flannel-shirt-jeans.jpg",
    color: "#e6edf4",
  },
  {
    age: "14–16",
    query: "14-16",
    label: "Their own kind of cool",
    image: "teen-girl-ribbed-polo-trouser-set.jpg",
    color: "#ede7f2",
  },
];

function ProductRail({
  products,
  loading,
  error,
}: {
  products: StoreProduct[];
  loading: boolean;
  error: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  return (
    <>
      <div className="rail-heading">
        <div>
          <span className="eyebrow">THE EVERYDAY FAVOURITES</span>
          <h2>Small styles. Big personality.</h2>
          <p>Fresh finds for all the things they love to do.</p>
        </div>
        <div className="rail-controls">
          <Link className="text-link" href="/products">
            Shop the collection <ArrowUpRight size={18} />
          </Link>
          <div>
            <button
              className="circle-button"
              aria-label="Previous products"
              onClick={() =>
                rail.current?.scrollBy({
                  left: -rail.current.clientWidth,
                  behavior: reduced ? "instant" : "smooth",
                })
              }
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="circle-button"
              aria-label="Next products"
              onClick={() =>
                rail.current?.scrollBy({
                  left: rail.current.clientWidth,
                  behavior: reduced ? "instant" : "smooth",
                })
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      {error ? (
        <div role="status" className="empty-state">
          <p>{error}</p>
          <Link href="/products" className="text-link">
            Open the collection <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div
          ref={rail}
          className="product-rail"
          aria-label="Featured clothing"
          aria-busy={loading}
        >
          {loading ? (
            Array.from({ length: 4 }, (_, i) => <ProductSkeleton key={i} />)
          ) : products.length ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="empty-state">
              New favourites are on their way. Explore our collections below.
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default function Home() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api
      .getCached<StoreProduct[]>("/products?sortBy=featured&limit=12", 30000)
      .then(({ data }) => {
        if (!data.success) throw new Error("Catalog unavailable");
        if (active) setProducts(data.data || []);
      })
      .catch(() => {
        if (active)
          setError(
            "We couldn’t load the latest styles. Please explore the collection or try again shortly.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const reduced = useReducedMotion();
  return (
    <div className="home-page">
      <section className="hero-wrap">
        <div className="hero">
          <div className="hero-copy">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <span className="hero-eyebrow">
                <span /> A LITTLE JOY, EVERY DAY
              </span>
              <h1>
                Made for little
                <br />
                moments.
                <br />
                <span>And big adventures.</span>
              </h1>
              <p>
                Playful styles. Feel-good comfort.
                <br />
                Clothes that let them be wonderfully them.
              </p>
              <div className="hero-buttons">
                <Link href="/products" className="button-primary">
                  Explore the collection <ArrowUpRight size={19} />
                </Link>
                <Link href="/products?ageGroup=0-2" className="hero-secondary">
                  For the tiniest ones <ArrowRight size={16} />
                </Link>
              </div>
              <span className="hero-footnote">
                From their first steps to their next big thing · Ages 0–16
              </span>
            </motion.div>
          </div>
          <div className="hero-visual">
            <Image
              unoptimized
              src="/images/campaign/little-moments.webp"
              alt="Two children laughing together in a sage cotton shirt and a lavender dress"
              width="1200"
              height="800"
              fetchPriority="high"
              className="hero-image"
            />
            <span className="hero-flower flower-one" aria-hidden="true">
              <Flower2 />
            </span>
            <span className="hero-flower flower-two" aria-hidden="true">
              <Sun />
            </span>
            <div className="hero-sticker">
              <span>100%</span>
              <small>
                READY FOR
                <br />
                PLAYTIME
              </small>
            </div>
            <div className="hero-caption">
              <span>THE LITTLE JOY EDIT</span>
              <Link href="/products">
                Find their happy <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <div className="joy-strip">
        <span>More play.</span>
        <Flower2 size={19} />
        <span>More colour.</span>
        <Flower2 size={19} />
        <span>More being themselves.</span>
        <Flower2 size={19} />
        <span>That’s the Aarti way.</span>
      </div>
      <section className="shell section-space">
        <Reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">GROWING UP LOOKS GOOD ON THEM</span>
              <h2>A little something for every age.</h2>
            </div>
            <Link className="text-link" href="/products">
              View all <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
        <div className="age-grid">
          {ages.map((age, i) => (
            <Reveal delay={i * 0.045} key={age.query}>
              <Link
                href={`/products?ageGroup=${age.query}`}
                className="age-card"
              >
                <div style={{ background: age.color }}>
                  <Image
                    sizes="(max-width: 640px) 40vw, 20vw"
                    src={`/images/products/${age.image}`}
                    alt={`Clothing for ${age.age} year olds`}
                    width="350"
                    height="450"
                    loading="lazy"
                  />
                  <span>
                    {age.age}
                    <small>YEARS</small>
                  </span>
                </div>
                <h3>{age.label}</h3>
                <span className="age-shop">
                  Shop now <ArrowUpRight size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="shell collection-duo">
        <Reveal>
          <Link
            href="/products?gender=BOYS"
            className="collection-banner boys-banner"
          >
            <div>
              <span className="eyebrow">FOR THE LITTLE ADVENTURERS</span>
              <h2>
                Ready, set,
                <br />
                go play.
              </h2>
              <span className="button-light">
                Shop boys <ArrowUpRight size={17} />
              </span>
            </div>
            <Image
              sizes="(max-width: 640px) 55vw, 27vw"
              src="/images/products/boys-dino-tee.jpg"
              alt="Comfortable graphic tee from the boys collection"
              width="550"
              height="730"
              loading="lazy"
            />
          </Link>
        </Reveal>
        <Reveal delay={0.08}>
          <Link
            href="/products?gender=GIRLS"
            className="collection-banner girls-banner"
          >
            <div>
              <span className="eyebrow">FOR THEIR MAIN CHARACTER MOMENTS</span>
              <h2>
                A little twirl.
                <br />A lot of joy.
              </h2>
              <span className="button-light">
                Shop girls <ArrowUpRight size={17} />
              </span>
            </div>
            <Image
              sizes="(max-width: 640px) 55vw, 27vw"
              src="/images/products/girls-floral-party-frock.jpg"
              alt="Peach party frock from the girls collection"
              width="550"
              height="730"
              loading="lazy"
            />
          </Link>
        </Reveal>
      </section>
      <section className="shell section-space">
        <Reveal>
          <ProductRail products={products} loading={loading} error={error} />
        </Reveal>
      </section>
      <section className="festive-wrap">
        <Reveal className="shell festive-inner">
          <div className="festive-photo">
            <Image
              sizes="(max-width: 640px) 100vw, 45vw"
              src="/images/categories/festive-party-wear.jpg"
              alt="Festive clothing for their special occasions"
              loading="lazy"
              width="800"
              height="700"
            />
            <span className="festive-mark" aria-hidden="true">
              ✳
            </span>
          </div>
          <div className="festive-copy">
            <span className="eyebrow">LITTLE OUTFITS. BIG CELEBRATIONS.</span>
            <h2>
              Every occasion.
              <br />A little more special.
            </h2>
            <p>
              From family festivities to their very own spotlight moments. Find
              outfits they’ll love making memories in.
            </p>
            <Link href="/products?search=festive" className="button-primary">
              Explore the festive edit <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
      <section className="shell section-space story-section">
        <Reveal>
          <span className="eyebrow">CHILDHOOD, BEAUTIFULLY DRESSED</span>
          <h2>
            For the messy days.
            <br />
            The dress-up days.
            <br />
            <span>The “just one more minute” days.</span>
          </h2>
          <p>
            We believe the best outfits make room for childhood.
            <br />
            Discover everyday essentials and special little finds, all in one
            happy place.
          </p>
          <Link className="text-link" href="/products">
            Find their next favourite <ArrowUpRight size={18} />
          </Link>
          <Sparkles className="story-sparkle" size={38} strokeWidth={1} />
        </Reveal>
      </section>
    </div>
  );
}
