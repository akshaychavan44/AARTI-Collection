"use client";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function Storefront({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const section = pathname?.startsWith("/products/")
    ? "route-detail"
    : ["/login", "/register", "/forgot-password", "/reset-password"].includes(
          pathname || "",
        )
      ? "route-auth"
      : pathname === "/"
        ? "route-home"
        : pathname === "/products"
          ? "route-catalog"
          : "route-account";
  return (
    <MotionConfig reducedMotion="user">
      <div
        className={
          pathname?.startsWith("/admin")
            ? "admin-shell"
            : `storefront ${section}`
        }
      >
        {children}
      </div>
    </MotionConfig>
  );
}
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
