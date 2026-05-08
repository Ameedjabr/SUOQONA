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
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { href: "/admin/products", icon: Package, label: "Products", key: "products" },
  { href: "/admin/categories", icon: Layers, label: "Categories", key: "categories" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders", key: "orders" },
  { href: "/admin/customers", icon: Users, label: "Customers", key: "customers" },
  { href: "/admin/inventory", icon: Warehouse, label: "Inventory", key: "inventory" },
  { href: "/admin/settings", icon: Settings, label: "Settings", key: "settings" },
];

export function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const pageTitles: Record<string, string> = {
    dashboard: "Dashboard",
    products: "Products",
    categories: "Categories",
    orders: "Orders",
    customers: "Customers",
    inventory: "Inventory",
    settings: "Settings",
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col"
            style={{
              background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
            }}
          >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-indigo-700/50">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-lg flex items-center justify-center shadow-lg">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-bold text-base tracking-tight">Souqona</span>
                  <p className="text-indigo-300 text-xs">Admin Panel</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-700/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
              <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
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

            {/* User Section */}
            <div className="p-4 border-t border-indigo-700/50">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-800/40 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user?.fullName || "Admin"}</p>
                  <p className="text-indigo-300 text-xs truncate">{user?.email || ""}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 border border-transparent transition-all duration-200 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: sidebarOpen ? 256 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col min-w-0"
      >
        {/* Topbar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors">
                Admin
              </Link>
              {currentPage && currentPage !== "dashboard" && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-900 font-semibold capitalize">
                    {pageTitles[currentPage] || currentPage}
                  </span>
                </>
              )}
              {currentPage === "dashboard" && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-900 font-semibold">Dashboard</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center cursor-pointer">
              <span className="text-white text-sm font-bold">
                {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
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
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${
          active
            ? "bg-white/15 text-white shadow-sm"
            : "text-indigo-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        {active && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 w-1 h-8 bg-violet-400 rounded-r-full"
          />
        )}
        <Icon
          className={`w-5 h-5 flex-shrink-0 transition-colors ${
            active ? "text-violet-300" : "text-indigo-400 group-hover:text-indigo-200"
          }`}
        />
        <span className="text-sm font-medium">{label}</span>
        {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-300 opacity-60" />}
      </motion.div>
    </Link>
  );
}
