"use client";

import { usePathname } from "next/navigation";
import MobileBottomNav from "./MobileBottomNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideBottomNav =
    pathname?.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <>
      <div className={hideBottomNav ? "" : "pb-16 md:pb-0"}>
        {children}
      </div>
      <MobileBottomNav />
    </>
  );
}
