"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { orderApi } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import ChatWidget from "@/components/ChatWidget";
import { motion } from "framer-motion";
import { ShoppingBag, ChevronRight, Package, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/i18n";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "#FEFCE8", color: "#CA8A04" },
  CONFIRMED: { bg: "#EFF6FF", color: "#1D4ED8" },
  SHIPPED:   { bg: "#F0F9FF", color: "#0284C7" },
  DELIVERED: { bg: "#F0FDF4", color: "#16A34A" },
  CANCELLED: { bg: "#FFF1F0", color: "#DC2626" },
};

export default function MyOrders() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  useProtectedRoute("CUSTOMER");

  const [orders, setOrders]   = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    orderApi.getMyOrders(accessToken)
      .then((r) => setOrders(Array.isArray(r) ? r : (r?.orders ?? [])))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100 px-6 py-10">
          <div className="max-w-5xl mx-auto">
            <Link href="/account" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline" style={{ color: "#FF5533" }}>
              <ArrowLeft className="w-4 h-4" /> {t("orders.backToAccount")}
            </Link>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#FF5533" }}>{t("account.title")}</p>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0F1F3D]">{t("orders.title")}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("orders.subtitle")}</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-5 py-4">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-gray-400">
              <Package className="w-16 h-16 opacity-20 mb-4" />
              <p className="text-xl font-black text-gray-600">{t("orders.noOrders")}</p>
              <p className="text-sm mt-1">{t("orders.noOrdersDesc")}</p>
              <Link href="/products">
                <button
                  className="mt-6 px-7 py-3 text-sm font-bold text-white rounded-xl transition hover:brightness-110"
                  style={{ background: "#FF5533" }}
                >
                  {t("orders.browseProducts")}
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, i) => {
                const st = STATUS_COLORS[order.status] || { bg: "#F7F4EF", color: "#6B7280" };
                const statusLabel = t(`orders.status.${order.status}`, { defaultValue: order.status });
                const itemCount = order.items?.length ?? 0;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/account/orders/${order.id}`}>
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 px-6 py-5 flex items-center gap-4 cursor-pointer group">
                        {/* Icon */}
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FFF1F0" }}>
                          <ShoppingBag className="w-5 h-5" style={{ color: "#FF5533" }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-[#0F1F3D]">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            &nbsp;·&nbsp;{t("orders.items", { count: itemCount })}
                          </p>
                        </div>

                        {/* Status + price */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-black text-[#0F1F3D] mb-1.5">
                            ₪{(order.totalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}
                          </p>
                          <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: st.bg, color: st.color }}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#FF5533] transition-colors flex-shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
