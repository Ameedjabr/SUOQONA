"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Store,
  Warehouse,
  Layers,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const navItems = [
  { href: "/admin",            icon: LayoutDashboard, label: "Dashboard",  key: "dashboard"  },
  { href: "/admin/products",   icon: Package,         label: "Products",   key: "products"   },
  { href: "/admin/categories", icon: Layers,          label: "Categories", key: "categories" },
  { href: "/admin/orders",     icon: ShoppingCart,    label: "Orders",     key: "orders"     },
  { href: "/admin/customers",  icon: Users,           label: "Customers",  key: "customers"  },
  { href: "/admin/inventory",  icon: Warehouse,       label: "Inventory",  key: "inventory"  },
  { href: "/admin/settings",   icon: Settings,        label: "Settings",   key: "settings"   },
];

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard", products: "Products", categories: "Categories",
  orders: "Orders", customers: "Customers", inventory: "Inventory", settings: "Settings",
};

export function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-[#F7F4EF] overflow-hidden">
      {/* ── Sidebar ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -272 }}
            animate={{ x: 0 }}
            exit={{ x: -272 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col"
            style={{ background: "#0F1F3D" }}
          >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
              <Link href="/admin" className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: "#FF5533" }}
                >
                  <Store className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-black text-base tracking-tight">Souqona</span>
                  <p className="text-white/40 text-[11px]">Admin Panel</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">
                Main Menu
              </p>
              {navItems.map((item) => (
                <SidebarLink
                  key={item.key}
                  href={item.href}
                  Icon={item.icon}
                  label={item.label}
                  active={currentPage === item.key}
                />
              ))}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FF5533" }}
                >
                  <span className="text-white text-sm font-bold">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{user?.fullName || "Admin"}</p>
                  <p className="text-white/40 text-xs truncate">{user?.email || ""}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/20 transition-all duration-200 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <motion.main
        animate={{ marginLeft: sidebarOpen ? 256 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col min-w-0"
      >
        {/* Topbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-gray-500 hover:text-[#0F1F3D] hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/admin" className="text-gray-400 hover:text-[#0F1F3D] transition-colors font-medium">
                Admin
              </Link>
              {currentPage && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  <span className="text-[#0F1F3D] font-bold capitalize">
                    {pageTitles[currentPage] || currentPage}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-[#0F1F3D] hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5533] rounded-full" />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: "#FF5533" }}
            >
              <span className="text-white text-sm font-bold">
                {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

interface SidebarLinkProps {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}

function SidebarLink({ href, Icon, label, active }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer group ${
          active ? "bg-white/12 text-white" : "text-white/50 hover:bg-white/8 hover:text-white"
        }`}
      >
        {/* Active left accent bar */}
        {active && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
            style={{ background: "#FF5533" }}
          />
        )}
        <Icon
          className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
            active ? "text-[#FF5533]" : "text-white/40 group-hover:text-white/70"
          }`}
        />
        <span className="text-sm font-medium">{label}</span>
        {active && (
          <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" style={{ color: "#FF5533" }} />
        )}
      </motion.div>
    </Link>
  );
}
