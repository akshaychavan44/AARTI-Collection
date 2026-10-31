"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Heart, MapPin, MessageCircle, Phone, ShoppingBag } from "lucide-react";
import { STORE_WHATSAPP_NUMBER } from "@/config/whatsapp";
import styles from "./Footer.module.css";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const whatsapp = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Aarti Collection! I’d like some help with sizing or an order.")}`;

  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.inner}`}>
        <div className={styles.grid}>
          <div className={styles.about}>
            <Link href="/" className={styles.brand} aria-label="Aarti Collection home">
              <span>AARTI<span className={styles.flower} aria-hidden="true">✳</span></span>
              <small>COLLECTION</small>
            </Link>
            <p>For little personalities. For big, beautiful childhoods. Discover everyday favourites and special occasion styles for ages 0–16.</p>
            <span className={styles.location}><MapPin size={14} /> Kalyan, Maharashtra</span>
            <div className={styles.shortcuts}>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat with Aarti Collection on WhatsApp"><MessageCircle size={18} /></a>
              <a href={`tel:+${STORE_WHATSAPP_NUMBER}`} aria-label="Call Aarti Collection"><Phone size={17} /></a>
              <Link href="/products" aria-label="Shop the collection"><ShoppingBag size={18} /></Link>
            </div>
          </div>

          <nav className={styles.column} aria-label="Footer quick links">
            <h2>Quick links</h2>
            <Link href="/">Home</Link>
            <Link href="/products">Shop all</Link>
            <Link href="/products?gender=BOYS">Boys collection</Link>
            <Link href="/products?gender=GIRLS">Girls collection</Link>
            <Link href="/products?ageGroup=0-2">Baby & toddler</Link>
            <Link href="/products?search=festive">The festive edit</Link>
          </nav>

          <nav className={styles.column} aria-label="Footer account and support">
            <h2>Your little world</h2>
            <Link href="/profile">My account</Link>
            <Link href="/account/orders">My orders</Link>
            <Link href="/wishlist">My wishlist</Link>
            <Link href="/cart">Shopping bag</Link>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={styles.contact}>Let’s find their perfect fit <ArrowUpRight size={15} /></a>
            <a href={`tel:+${STORE_WHATSAPP_NUMBER}`} className={styles.phone}>+91 72088 30380</a>
          </nav>
        </div>

        <div className={styles.watermark} aria-hidden="true">AARTI COLLECTION</div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} AARTI COLLECTION. All rights reserved.</span>
          <span>Little details. Lots of love. <Heart size={12} /></span>
          <span>UPI · Cards · Netbanking</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
