"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/hooks/useProtectedRoute";
import { Pagination } from "@/components/ui";
import { productApi, Product } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  DRAFT: "bg-amber-100 text-amber-700",
  ARCHIVED: "bg-slate-100 text-slate-600",
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
];

const PAGE_SIZE = 20;

export default function AdminProducts() {
  const { accessToken } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts]       = useState<Product[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [isDeleting, setIsDeleting]   = useState(false);
  const [toast, setToast]             = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => { loadProducts(); }, [search, statusFilter, accessToken]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // Client-side pagination over allProducts
  useEffect(() => {
    const total = Math.ceil(allProducts.length / PAGE_SIZE) || 1;
    setTotalPages(total);
    setProducts(allProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
  }, [allProducts, page]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      // The backend defaults to ACTIVE only, so to show all statuses we fetch each
      if (statusFilter) {
        const result = await productApi.search({ page: 1, limit: 500, search: search || undefined, status: statusFilter });
        setAllProducts(result.products || []);
      } else {
        const result = await productApi.searchAll({ search: search || undefined });
        setAllProducts(result.products || []);
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    setIsDeleting(true);
    try {
      await productApi.delete(accessToken, id);
      showToast("success", "Product deleted successfully");
      setDeleteId(null);
      loadProducts();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const stats = {
    total: allProducts.length,
    active: allProducts.filter((p) => p.status === "ACTIVE").length,
    draft: allProducts.filter((p) => p.status === "DRAFT").length,
    archived: allProducts.filter((p) => p.status === "ARCHIVED").length,
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout currentPage="products">
        <div className="p-5 space-y-4 max-w-[1400px] mx-auto">

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

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Products</h1>
              <p className="text-slate-500 text-base mt-1">Manage your store catalog</p>
            </div>
            <Link href="/admin/products/new">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                New Product
              </button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-slate-700" },
              { label: "Active", value: stats.active, color: "text-emerald-600" },
              { label: "Draft", value: stats.draft, color: "text-amber-600" },
              { label: "Archived", value: stats.archived, color: "text-slate-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search + Status Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products by title, brand, slug..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="flex-1 text-sm text-slate-900 placeholder-slate-400 bg-transparent outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setStatusFilter(f.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === f.value
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
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
                    <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-48" />
                      <div className="h-3 bg-slate-100 rounded w-32" />
                    </div>
                    <div className="h-4 bg-slate-100 rounded w-20" />
                    <div className="h-6 bg-slate-100 rounded-full w-16" />
                    <div className="h-8 bg-slate-100 rounded-lg w-20" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Package className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-slate-600">No products found</p>
                <p className="text-sm mt-1">
                  {search ? "Try a different search term" : "Get started by creating your first product"}
                </p>
                {!search && (
                  <Link href="/admin/products/new">
                    <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                      <Plus className="w-4 h-4" /> Create Product
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {products.map((product, i) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {product.images?.[0]?.url ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.images[0].alt || product.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{product.title}</p>
                                <p className="text-xs text-slate-400 font-mono">{product.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{product.brand || <span className="text-slate-300">—</span>}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900 tabular-nums">
                            {product.priceCents ? `₪${(product.priceCents / 100).toFixed(2)}` : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[product.status] || STATUS_STYLES.DRAFT}`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/admin/products/${product.id}`}>
                                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                                  <Edit2 className="w-3 h-3" /> Edit
                                </button>
                              </Link>
                              <button
                                onClick={() => setDeleteId(product.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} isLoading={isLoading} />
              </>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !isDeleting && setDeleteId(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
              >
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 text-center">Delete Product?</h2>
                <p className="text-slate-500 text-sm text-center mt-2 mb-6">
                  This action is permanent and cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteId)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
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
