"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { productApi, categoryApi, Product, Category } from "@/services/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

const SUBCATEGORY_STYLES: Record<string, { icon: string; bg: string }> = {
  electronics:       { icon: "📱", bg: "bg-slate-900" },
  clothing:          { icon: "👕", bg: "bg-rose-500" },
  "mens-clothing":   { icon: "👔", bg: "bg-slate-700" },
  "womens-clothing": { icon: "👗", bg: "bg-pink-400" },
  home:              { icon: "🏠", bg: "bg-emerald-600" },
  furniture:         { icon: "🛋️", bg: "bg-amber-500" },
  kitchen:           { icon: "🍳", bg: "bg-orange-500" },
  phones:            { icon: "📲", bg: "bg-cyan-600" },
  laptops:           { icon: "💻", bg: "bg-indigo-700" },
  accessories:       { icon: "🎧", bg: "bg-violet-600" },
  sports:            { icon: "⚽", bg: "bg-green-600" },
  football:          { icon: "🏈", bg: "bg-green-700" },
  basketball:        { icon: "🏀", bg: "bg-orange-600" },
  fitness:           { icon: "🏋️", bg: "bg-blue-700" },
  default:           { icon: "🛍️", bg: "bg-gray-700" },
};

export default function CategoryPage() {
  const { t } = useTranslation();
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const SORT_OPTIONS = [
    { value: "newest",     label: t("products.sort.newest")    },
    { value: "price-asc",  label: t("products.sort.priceAsc")  },
    { value: "price-desc", label: t("products.sort.priceDesc") },
  ];

  useEffect(() => {
    if (!slug) return;
    categoryApi.getAll()
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        const flat: Category[] = [];
        const flatten = (cats: Category[]) => {
          for (const c of cats) {
            flat.push(c);
            if (c.children?.length) flatten(c.children);
          }
        };
        flatten(all);
        const found = flat.find((c) => c.slug === slug);
        setCategory(found || null);
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    loadProducts();
  }, [slug, page, search, sort]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const result = await productApi.search({
        page,
        limit: 20,
        categorySlug: slug,
        search: search || undefined,
        sort: sort || undefined,
      });
      setProducts(result.products || []);
      setTotalPages(result.pages || 1);
      setTotal(result.total || result.products?.length || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> {t("common.backToHome")}
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {category?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ")}
                </h1>
                <p className="text-gray-500 mt-1">
                  {total > 0 ? t("products.found", { count: total }) : t("products.browseInCategory")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Subcategory cards */}
          {category?.children && category.children.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t("common.browseSubcategories")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {category.children.map((child) => {
                  const style = SUBCATEGORY_STYLES[child.slug] || SUBCATEGORY_STYLES.default;
                  return (
                    <Link key={child.id} href={`/categories/${child.slug}`}>
                      <motion.div
                        whileHover={{ scale: 0.97 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${style.bg} rounded-2xl p-5 flex items-center justify-between cursor-pointer group`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{style.icon}</span>
                          <span className="text-white font-semibold text-sm">{child.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition" />
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search + Sort bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-56 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={t("common.searchInCategory")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
              />
              {search && (
                <button onClick={() => { setSearch(""); setPage(1); }} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Products grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-20" />
                    <div className="h-5 bg-gray-100 rounded w-full" />
                    <div className="h-6 bg-gray-100 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Package className="w-16 h-16 opacity-20 mb-4" />
              <p className="text-xl font-semibold text-gray-600">{t("products.notFound")}</p>
              <p className="text-sm mt-2">
                {search ? t("products.tryDifferentSearch") : t("products.noCategoryProducts")}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  {t("common.clearAll")}
                </button>
              )}
            </div>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {products.map((product) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <Link href={`/products/${product.slug}`}>
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full">
                        <div className="relative h-52 bg-gray-100 overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                          {product.compareAtPriceCents && product.priceCents && product.compareAtPriceCents > product.priceCents && (
                            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{Math.round(((product.compareAtPriceCents - product.priceCents) / product.compareAtPriceCents) * 100)}%
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          {product.brand && (
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{product.brand}</p>
                          )}
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                            {product.title}
                          </h3>
                          <div className="mt-3 flex items-baseline gap-2">
                            {product.priceCents ? (
                              <>
                                <span className="text-lg font-bold text-indigo-600">
                                  ₪{(product.priceCents / 100).toFixed(2)}
                                </span>
                                {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₪{(product.compareAtPriceCents / 100).toFixed(2)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">{t("products.priceNotSet")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    {t("common.previous")}
                  </button>
                  <span className="text-sm text-gray-500">{t("common.pageOf", { page, total: totalPages })}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    {t("common.next")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
