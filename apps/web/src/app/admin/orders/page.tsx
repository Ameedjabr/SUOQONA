"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Clock, CheckCircle2, Truck, XCircle, Eye, Filter } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/hooks/useProtectedRoute";
import { Pagination } from "@/components/ui";
import { orderApi, Order } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   color: "bg-amber-100 text-amber-700",   dot: "bg-amber-400",   icon: <Clock className="w-3 h-3" /> },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700",     dot: "bg-blue-400",    icon: <CheckCircle2 className="w-3 h-3" /> },
  SHIPPED:   { label: "Shipped",   color: "bg-violet-100 text-violet-700", dot: "bg-violet-400",  icon: <Truck className="w-3 h-3" /> },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700",       dot: "bg-red-400",     icon: <XCircle className="w-3 h-3" /> },
};

const ALL_STATUSES = ["", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrders() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadOrders(); }, [page, search, statusFilter, accessToken]);

  const loadOrders = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const result = await orderApi.getAllOrders(accessToken, {
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setOrders(result.orders || []);
      setTotalPages(result.pages || 1);
      setTotal(result.total || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout currentPage="orders">
        <div className="p-6 space-y-5 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {total > 0 ? `${total.toLocaleString()} orders total` : "Manage customer orders"}
              </p>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl flex items-center justify-between"
              >
                {error}
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-lg">×</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-56 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search order #, customer name, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="flex-1 text-sm bg-transparent outline-none text-slate-900 placeholder-slate-400"
              />
              {search && <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 text-lg">×</button>}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s === "" ? "All" : STATUS_CONFIG[s]?.label || s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-32" />
                      <div className="h-3 bg-slate-100 rounded w-24" />
                    </div>
                    <div className="h-4 bg-slate-100 rounded w-28" />
                    <div className="h-4 bg-slate-100 rounded w-16" />
                    <div className="h-6 bg-slate-100 rounded-full w-20" />
                    <div className="h-8 bg-slate-100 rounded-lg w-16" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <ShoppingCart className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-slate-600">No orders found</p>
                <p className="text-sm mt-1">
                  {search || statusFilter ? "Try adjusting your filters" : "Orders will appear here once customers place them"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {orders.map((order, i) => {
                        const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                        const isPaid = order.paymentStatus === "COLLECTED";
                        return (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-900">#{order.orderNumber}</p>
                              <p className="text-xs text-slate-400">{order.items?.length || 0} item(s)</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-indigo-600">
                                    {order.customerName?.charAt(0)?.toUpperCase() || "?"}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800">{order.customerName}</p>
                                  <p className="text-xs text-slate-400">{order.customerEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-xs">{formatDate(order.createdAt)}</td>
                            <td className="px-6 py-4 font-semibold text-slate-900 tabular-nums">
                              ₪{(order.totalCents / 100).toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isPaid ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                {isPaid ? "Paid" : order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link href={`/admin/orders/${order.id}`}>
                                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                                  <Eye className="w-3 h-3" /> View
                                </button>
                              </Link>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} isLoading={isLoading} />
              </>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
