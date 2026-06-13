"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, AlertTriangle, CheckCircle, TrendingDown, Plus, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/hooks/useProtectedRoute";
import { productApi } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

export default function InventoryPage() {
  const { accessToken } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{ product: any } | null>(null);
  const [qty, setQty] = useState("50");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const load = () => {
    if (!accessToken) { setIsLoading(false); return; }
    setIsLoading(true);
    productApi.search({ limit: 100, status: "ACTIVE" })
      .then((res) => setProducts(res.products || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [accessToken]);

  const getAvail = (v: any) => (v.inventoryItem?.onHand ?? 0) - (v.inventoryItem?.reserved ?? 0);

  const inStock   = products.filter((p) => p.variants?.some((v: any) => getAvail(v) > 0));
  const lowStock  = products.filter((p) => p.variants?.some((v: any) => getAvail(v) > 0 && getAvail(v) <= 5));
  const outOfStock = products.filter((p) => p.variants?.every((v: any) => getAvail(v) <= 0));

  const statCards = [
    { label: "Total Products", value: products.length,    icon: Package,       color: "bg-indigo-50 text-indigo-600" },
    { label: "In Stock",       value: inStock.length,     icon: CheckCircle,   color: "bg-emerald-50 text-emerald-600" },
    { label: "Low Stock",      value: lowStock.length,    icon: TrendingDown,  color: "bg-amber-50 text-amber-600" },
    { label: "Out of Stock",   value: outOfStock.length,  icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleReceive = async () => {
    if (!modal || !accessToken) return;
    const quantity = parseInt(qty);
    if (!quantity || quantity <= 0) return;

    setIsSubmitting(true);
    try {
      const variants = modal.product.variants ?? [];
      await Promise.all(
        variants.map((v: any) =>
          fetch(`${API_URL}/api/inventory/receive`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
            body: JSON.stringify({ variantId: v.id, quantity, note: note || "Manual restock" }),
          })
        )
      );
      showToast("success", `Added ${quantity} units to all variants of "${modal.product.title}"`);
      setModal(null);
      setQty("50");
      setNote("");
      load();
    } catch {
      showToast("error", "Failed to update stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout currentPage="inventory">
        <div className="p-5 space-y-5 max-w-[1400px] mx-auto">

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
                  toast.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {toast.type === "success" ? "✓" : "✕"} {toast.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
            <p className="text-slate-500 text-base mt-1">Track stock levels across all products.</p>
          </div>

          {/* Stat cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statCards.map((card) => (
              <motion.div key={card.label} variants={itemVariants}>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className={`w-11 h-11 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  {isLoading ? (
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-16" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                  )}
                  <p className="text-sm text-slate-500 mt-1">{card.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Product table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Stock Overview</h2>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-slate-400">
                <Package className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No products found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                <div className="grid grid-cols-5 px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="col-span-2">Product</span>
                  <span>Variants</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>
                {products.map((product) => {
                  const totalQty = product.variants?.reduce(
                    (sum: number, v: any) => sum + getAvail(v), 0
                  ) ?? 0;
                  const isLow = totalQty > 0 && totalQty <= 5;
                  const isOut = totalQty === 0;

                  return (
                    <div key={product.id} className="grid grid-cols-5 px-6 py-3.5 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/products/${product.id}`} className="text-sm font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                            {product.title}
                          </Link>
                          <p className="text-xs text-slate-400">{product.brand || "—"}</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-600">
                        {product.variants?.length ?? 0} variant{product.variants?.length !== 1 ? "s" : ""}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${
                        isOut ? "bg-red-100 text-red-600" :
                        isLow ? "bg-amber-100 text-amber-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {isOut ? <AlertTriangle className="w-3 h-3" /> : isLow ? <TrendingDown className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {isOut ? "Out of stock" : isLow ? `Low (${totalQty})` : `In stock (${totalQty})`}
                      </span>
                      <div className="flex justify-end">
                        <button
                          onClick={() => { setModal({ product }); setQty("50"); setNote(""); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Receive Stock
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Receive Stock Modal */}
        <AnimatePresence>
          {modal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !isSubmitting && setModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Receive Stock</h2>
                    <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[220px]">{modal.product.title}</p>
                  </div>
                  <button
                    onClick={() => setModal(null)}
                    disabled={isSubmitting}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-500">
                  This will add stock to all <span className="font-semibold text-slate-700">{modal.product.variants?.length ?? 0} variant{modal.product.variants?.length !== 1 ? "s" : ""}</span> of this product.
                </div>

                {/* Quantity input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Quantity to add <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 50"
                  />
                </div>

                {/* Note input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Note <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Weekly restock"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal(null)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReceive}
                    disabled={isSubmitting || !qty || parseInt(qty) <= 0}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AdminLayout>
    </ProtectedRoute>
  );
}
