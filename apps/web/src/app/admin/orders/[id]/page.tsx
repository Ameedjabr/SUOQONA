"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/hooks/useProtectedRoute";
import { orderApi, Order } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";

const ORDER_STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   color: "text-amber-700",   bg: "bg-amber-100",   icon: <Clock className="w-4 h-4" /> },
  CONFIRMED: { label: "Confirmed", color: "text-blue-700",    bg: "bg-blue-100",    icon: <CheckCircle2 className="w-4 h-4" /> },
  SHIPPED:   { label: "Shipped",   color: "text-violet-700",  bg: "bg-violet-100",  icon: <Truck className="w-4 h-4" /> },
  DELIVERED: { label: "Delivered", color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 className="w-4 h-4" /> },
  CANCELLED: { label: "Cancelled", color: "text-red-700",     bg: "bg-red-100",     icon: <XCircle className="w-4 h-4" /> },
};

export default function OrderDetail() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const { accessToken } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    if (!orderId || !accessToken) { setIsLoading(false); return; }

    async function loadOrder() {
      try {
        // Fetch orders page by page until found (no single-order endpoint)
        const result = await orderApi.getAllOrders(accessToken as string, { limit: 100, page: 1 });
        const found = result.orders?.find((o: Order) => o.id === orderId);
        if (found) { setOrder(found); setNewStatus(found.status); }
        else setError("Order not found");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [orderId, accessToken]);

  const handleStatusUpdate = async () => {
    if (!order || !accessToken || newStatus === order.status) return;
    setIsUpdating(true);
    try {
      const updated = await orderApi.updateStatus(accessToken, order.id, newStatus);
      setOrder(updated);
      setSuccessMsg("Status updated successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStepIndex = ORDER_STEPS.indexOf(order?.status || "PENDING");
  const isCancelled = order?.status === "CANCELLED";

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <AdminLayout currentPage="orders">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-sm mt-3">Loading order...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <AdminLayout currentPage="orders">
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">{error || "Order not found"}</div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout currentPage="orders">
        <div className="p-6 max-w-5xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/orders")}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${status.bg} ${status.color}`}>
              {status.icon} {status.label}
            </span>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
                {error}
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-lg">×</button>
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl">
                ✓ {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Tracker */}
          {!isCancelled && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-5">Order Progress</h2>
              <div className="flex items-center">
                {ORDER_STEPS.map((step, i) => {
                  const isComplete = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const stepCfg = STATUS_CONFIG[step];
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                          isComplete
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-slate-200 text-slate-300"
                        } ${isCurrent ? "shadow-lg shadow-indigo-200 scale-110" : ""}`}>
                          {isComplete ? <CheckCircle2 className="w-4 h-4" /> : stepCfg.icon}
                        </div>
                        <p className={`text-xs font-medium mt-2 ${isComplete ? "text-indigo-600" : "text-slate-400"}`}>
                          {stepCfg.label}
                        </p>
                      </div>
                      {i < ORDER_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 transition-colors ${i < currentStepIndex ? "bg-indigo-600" : "bg-slate-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Order Items */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-900">Order Items</h2>
                  <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {order.items?.length || 0} item(s)
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {order.items?.map((item) => (
                    <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item.productTitle}</p>
                        <p className="text-xs text-slate-400 font-mono">{item.variantSku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 tabular-nums">₪{(item.lineTotalCents / 100).toFixed(2)}</p>
                        <p className="text-xs text-slate-400">× {item.quantity} @ ₪{(item.unitPriceCents / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Totals */}
                <div className="px-6 py-4 bg-slate-50 space-y-2">
                  {[
                    { label: "Subtotal", value: order.subtotalCents, show: true },
                    { label: "Discount", value: -order.discountCents, show: order.discountCents > 0, color: "text-emerald-600" },
                    { label: "Shipping", value: order.shippingCents, show: order.shippingCents > 0 },
                    { label: "Tax (17%)", value: order.taxCents, show: order.taxCents > 0 },
                  ].filter((r) => r.show).map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{row.label}</span>
                      <span className={`font-medium tabular-nums ${(row as any).color || "text-slate-900"}`}>
                        {row.value < 0 ? `-₪${Math.abs(row.value / 100).toFixed(2)}` : `₪${(row.value / 100).toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-lg text-indigo-600 tabular-nums">₪{(order.totalCents / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Update Status */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-900">Update Status</h2>
                </div>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || newStatus === order.status}
                  className="mt-3 w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {isUpdating ? "Updating..." : "Save Status"}
                </button>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-900">Payment</h2>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method</span>
                    <span className="font-medium text-slate-900">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className={`font-semibold ${order.paymentStatus === "COLLECTED" ? "text-emerald-600" : "text-amber-600"}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  {order.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paid at</span>
                      <span className="text-slate-700">{new Date(order.paidAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-900">Customer</h2>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600">{order.customerName?.charAt(0)}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{order.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{order.phonePrimary}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-900">Shipping Address</h2>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-900">{order.customerName}</p>
                  <p>{order.addressLine1}</p>
                  {order.addressLine2 && <p>{order.addressLine2}</p>}
                  <p>{order.city}, {order.area} {order.postalCode}</p>
                  <p>{order.country}</p>
                  {order.deliveryNotes && (
                    <p className="mt-2 text-slate-400 text-xs italic">Note: {order.deliveryNotes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
