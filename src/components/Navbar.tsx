"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  LogOut,
  Package,
  Shield,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const links = [
  { name: "Home", href: "/" },
  { name: "Shop all", href: "/products" },
  { name: "Boys", href: "/products?gender=BOYS", gender: "BOYS" },
  { name: "Girls", href: "/products?gender=GIRLS", gender: "GIRLS" },
  { name: "Little ones", href: "/products?ageGroup=0-2" },
];
const ages = ["0-2", "3-5", "6-9", "10-13", "14-16"];
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(true);
  const [search, setSearch] = useState("");
  const header = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const accountToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function outside(e: MouseEvent) {
      if (!header.current?.contains(e.target as Node)) {
        setAccountOpen(false);
        setMobileOpen(false);
        setSearchOpen(false);
      }
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (searchOpen) searchToggle.current?.focus();
        else if (mobileOpen) mobileToggle.current?.focus();
        else if (accountOpen) accountToggle.current?.focus();
        setSearchOpen(false);
        setMobileOpen(false);
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [searchOpen, mobileOpen, accountOpen]);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);
  function close() {
    setMobileOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
  }
  if (pathname?.startsWith("/admin")) return null;
  return (
    <header className="site-header" ref={header}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {announcement && (
        <div className="announcement">
          <div className="announcement-copy">
            <span>Little outfits. Big adventures.</span>
            <span aria-hidden="true">✳</span>
            <span>Discover everyday & festive favourites</span>
            <span aria-hidden="true">✳</span>
            <span>A little joy for every age, 0–16</span>
          </div>
          <button
            onClick={() => setAnnouncement(false)}
            aria-label="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="header-main shell">
        <button
          className="icon-button mobile-menu-toggle"
          ref={mobileToggle}
          onClick={() => {
            setMobileOpen(!mobileOpen);
            setSearchOpen(false);
            setAccountOpen(false);
          }}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
        <Link
          href="/"
          className="brand"
          onClick={close}
          aria-label="Aarti Collection home"
        >
          <span>
            aarti<span className="brand-dot">✳</span>
          </span>
          <small>COLLECTION</small>
        </Link>
        <nav className="desktop-navigation" aria-label="Main navigation">
          {links.map((link) => (
            <div className="nav-item" key={link.name}>
              <Link
                href={link.href}
                onClick={close}
                aria-current={link.href === pathname ? "page" : undefined}
              >
                {link.name}
                {link.gender && <ChevronDown size={12} />}
              </Link>
              {link.gender && (
                <div className="nav-dropdown">
                  <span className="eyebrow">
                    A little style for every stage
                  </span>
                  <Link href={link.href}>
                    Shop all {link.name.toLowerCase()} <ArrowRight size={15} />
                  </Link>
                  {ages.map((age) => (
                    <Link key={age} href={`${link.href}&ageGroup=${age}`}>
                      {age.replace("-", "–")} years <ArrowRight size={14} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            ref={searchToggle}
            aria-label="Search products"
            aria-expanded={searchOpen}
            aria-controls="site-search"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setMobileOpen(false);
              setAccountOpen(false);
            }}
          >
            {searchOpen ? <X /> : <Search />}
          </button>
          <div className="account-container">
            <button
              className="icon-button account-toggle"
              ref={accountToggle}
              aria-label="Account menu"
              aria-expanded={accountOpen}
              aria-controls="account-menu"
              onClick={() => {
                setAccountOpen(!accountOpen);
                setMobileOpen(false);
                setSearchOpen(false);
              }}
            >
              <UserRound />
            </button>
            {accountOpen && (
              <div className="account-menu" id="account-menu">
                <strong>
                  {user
                    ? `Hello, ${user.name.split(" ")[0]}`
                    : "Welcome to Aarti"}
                </strong>
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" onClick={close}>
                      <UserRound size={16} />
                      My account
                    </Link>
                    <Link href="/account/orders" onClick={close}>
                      <Package size={16} />
                      My orders
                    </Link>
                    {user?.role === "ADMIN" && (
                      <Link href="/admin" onClick={close}>
                        <Shield size={16} />
                        Store dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        close();
                        logout();
                      }}
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={close}>
                      Sign in <ArrowRight size={16} />
                    </Link>
                    <Link href="/register" onClick={close}>
                      Create an account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <Link
            href="/wishlist"
            className="icon-button wishlist-header"
            aria-label={`Wishlist, ${wishlistCount} items`}
            onClick={close}
          >
            <Heart />
            {wishlistCount > 0 && (
              <span className="count-badge">{wishlistCount}</span>
            )}
          </Link>
          <Link
            href="/cart"
            className="icon-button"
            aria-label={`Shopping bag, ${cartCount} items`}
            onClick={close}
          >
            <ShoppingBag />
            <span className="count-badge">{cartCount}</span>
          </Link>
        </div>
      </div>
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            id="site-search"
            className="search-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <form
              className="shell search-form"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (search.trim()) {
                  router.push(
                    `/products?search=${encodeURIComponent(search.trim())}`,
                  );
                  close();
                }
              }}
            >
              <Search size={22} />
              <input
                ref={searchRef}
                aria-label="Search the collection"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="button-primary">
                Search <ArrowRight size={16} />
              </button>
            </form>
            <p className="shell search-hint">
              Try dresses, cotton tees, rompers or festive sets.
            </p>
          </motion.div>
        )}
        {mobileOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {links.map((link) => (
              <Link key={link.name} href={link.href} onClick={close}>
                {link.name}
                <ArrowRight size={20} />
              </Link>
            ))}
            <Link
              href={isAuthenticated ? "/profile" : "/login"}
              onClick={close}
            >
              My account <UserRound size={20} />
            </Link>
            <Link href="/account/orders" onClick={close}>
              My orders <Package size={20} />
            </Link>
            <Link href="/wishlist" onClick={close}>
              My wishlist <Heart size={20} />
            </Link>
            <p>
              <Sparkles size={16} /> Small styles. Endless possibilities.
            </p>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
