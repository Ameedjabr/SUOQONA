"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/hooks/useProtectedRoute";
import { orderApi, productApi, userApi, Order } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: Order[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: <Clock className="w-3 h-3" /> },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  SHIPPED: { label: "Shipped", color: "bg-violet-100 text-violet-700", icon: <Truck className="w-3 h-3" /> },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

export default function AdminDashboard() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setIsLoading(false); return; }

    async function loadStats() {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          orderApi.getAllOrders(accessToken as string, { limit: 10, page: 1 }),
          productApi.search({ limit: 100 }),
          userApi.getAll(accessToken as string, { limit: 100 }),
        ]);

        const orders: Order[] = ordersRes.orders || [];
        const totalRevenue = orders.reduce((sum: number, o: Order) => sum + o.totalCents, 0);

        setStats({
          totalOrders: ordersRes.total || orders.length,
          totalProducts: productsRes.total || productsRes.products?.length || 0,
          totalCustomers: usersRes.total || usersRes.users?.length || 0,
          totalRevenue,
          recentOrders: orders.slice(0, 6),
        });
      } catch {
        // silently fail — show zeros
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [accessToken]);

  const statCards = [
    {
      title: "Total Revenue",
      value: `₪${(stats.totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      gradient: "from-violet-500 to-indigo-600",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      href: "/admin/orders",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      href: "/admin/orders",
    },
    {
      title: "Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      href: "/admin/products",
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      gradient: "from-orange-500 to-pink-500",
      bg: "bg-orange-50",
      iconColor: "text-orange-600",
      href: "/admin/customers",
    },
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout currentPage="dashboard">
        <div className="p-5 space-y-4 max-w-[1400px] mx-auto">

          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
            <p className="text-slate-500 text-base mt-1">Welcome back — here's what's happening in your store.</p>
          </div>

          {/* Stat Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statCards.map((card) => (
              <motion.div key={card.title} variants={itemVariants}>
                <Link href={card.href}>
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                        <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    {isLoading ? (
                      <div className="space-y-2">
                        <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-24" />
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-16" />
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-slate-900 tabular-nums">{card.value}</p>
                        <p className="text-sm text-slate-500 mt-1 font-medium">{card.title}</p>
                      </>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recent Orders */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
                <Link
                  href="/admin/orders"
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="h-10 w-10 bg-slate-100 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-32" />
                        <div className="h-3 bg-slate-100 rounded w-24" />
                      </div>
                      <div className="h-6 bg-slate-100 rounded-full w-20" />
                      <div className="h-4 bg-slate-100 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : stats.recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {stats.recentOrders.map((order, i) => {
                    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link href={`/admin/orders/${order.id}`}>
                          <div className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                              <ShoppingCart className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900">#{order.orderNumber}</p>
                              <p className="text-xs text-slate-400 truncate">{order.customerName}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.icon}
                              {status.label}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 tabular-nums flex-shrink-0">
                              ₪{(order.totalCents / 100).toFixed(2)}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { href: "/admin/products/new", icon: Package, label: "Add New Product", desc: "Create a product listing", color: "bg-emerald-50 text-emerald-600" },
                  { href: "/admin/orders", icon: ShoppingCart, label: "Manage Orders", desc: "View & update orders", color: "bg-blue-50 text-blue-600" },
                  { href: "/admin/customers", icon: Users, label: "View Customers", desc: "Browse customer accounts", color: "bg-orange-50 text-orange-600" },
                  { href: "/admin/settings", icon: TrendingUp, label: "Store Settings", desc: "Configure your store", color: "bg-violet-50 text-violet-600" },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                      <div className={`w-9 h-9 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{action.label}</p>
                        <p className="text-xs text-slate-400">{action.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
