"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { labelKey: "mobileNav.home",    href: "/",         icon: Home },
    { labelKey: "mobileNav.shop",    href: "/products", icon: Search },
    { labelKey: "mobileNav.cart",    href: "/cart",     icon: ShoppingCart },
    { labelKey: "mobileNav.account", href: "/account",  icon: User },
  ];

  if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href) ?? false;
  };

  const getHref = (item: typeof NAV_ITEMS[number]) => {
    if (item.href === "/account" && !isAuthenticated) return "/login";
    return item.href;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "#0F1F3D",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const href = getHref(item);

          return (
            <Link
              key={item.href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors"
              style={{ color: active ? "#FF5533" : "rgba(255,255,255,0.45)" }}
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: "#FF5533" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className="w-5 h-5 transition-transform"
                style={{ transform: active ? "scale(1.15)" : "scale(1)" }}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span className="text-[10px] font-bold tracking-wide transition-all" style={{ opacity: active ? 1 : 0.7 }}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
