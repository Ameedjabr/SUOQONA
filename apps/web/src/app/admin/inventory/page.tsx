"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/hooks/useProtectedRoute";
import { productApi } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

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

  useEffect(() => {
    if (!accessToken) { setIsLoading(false); return; }
    productApi.search({ limit: 100, status: "ACTIVE" })
      .then((res) => setProducts(res.products || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  const inStock = products.filter((p) =>
    p.variants?.some((v: any) => v.inventoryItem?.quantity > 0)
  );
  const lowStock = products.filter((p) =>
    p.variants?.some((v: any) => v.inventoryItem?.quantity > 0 && v.inventoryItem?.quantity <= 5)
  );
  const outOfStock = products.filter((p) =>
    p.variants?.every((v: any) => !v.inventoryItem || v.inventoryItem.quantity === 0)
  );

  const statCards = [
    { label: "Total Products", value: products.length, icon: Package, color: "bg-indigo-50 text-indigo-600" },
    { label: "In Stock", value: inStock.length, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
    { label: "Low Stock", value: lowStock.length, icon: TrendingDown, color: "bg-amber-50 text-amber-600" },
    { label: "Out of Stock", value: outOfStock.length, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout currentPage="inventory">
        <div className="p-5 space-y-5 max-w-[1400px] mx-auto">
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
                <div className="grid grid-cols-4 px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="col-span-2">Product</span>
                  <span>Variants</span>
                  <span>Status</span>
                </div>
                {products.map((product) => {
                  const totalQty = product.variants?.reduce(
                    (sum: number, v: any) => sum + (v.inventoryItem?.quantity ?? 0), 0
                  ) ?? 0;
                  const isLow = totalQty > 0 && totalQty <= 5;
                  const isOut = totalQty === 0;

                  return (
                    <div key={product.id} className="grid grid-cols-4 px-6 py-3.5 items-center hover:bg-slate-50 transition-colors">
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
                      <span className="text-sm text-slate-600">{product.variants?.length ?? 0} variant{product.variants?.length !== 1 ? "s" : ""}</span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${
                        isOut ? "bg-red-100 text-red-600" :
                        isLow ? "bg-amber-100 text-amber-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {isOut ? <AlertTriangle className="w-3 h-3" /> : isLow ? <TrendingDown className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {isOut ? "Out of stock" : isLow ? `Low (${totalQty})` : `In stock (${totalQty})`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
