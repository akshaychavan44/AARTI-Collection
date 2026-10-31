import type { Metadata } from "next";
import { Geist, Geist_Mono, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import "./storefront.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Storefront } from "@/components/Storefront";

const displayFont = Be_Vietnam_Pro({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aarti Collection | Kids Clothing & Ethnic Wear (Ages 0–16)",
  description:
    "High-quality kids clothing, festive ethnic wear, frocks, shirts, and everyday essentials from Aarti Collection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#1c1917] selection:bg-[#EFECE6] selection:text-[#1c1917]">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Storefront>
                <Navbar />
                <main id="main-content" tabIndex={-1} className="flex-1">
                  {children}
                </main>
                <Footer />
              </Storefront>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
