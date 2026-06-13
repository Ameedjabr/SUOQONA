"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Package, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { productApi, categoryApi, Product, Category } from "@/services/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

const PRICE_PRESETS_CFG = [
  { key: "under100",    min: 0,    max: 100   },
  { key: "100to500",    min: 100,  max: 500   },
  { key: "500to1500",   min: 500,  max: 1500  },
  { key: "1500to5000",  min: 1500, max: 5000  },
  { key: "over5000",    min: 5000, max: 99999 },
];

const SORT_KEYS = [
  { value: "newest",     key: "newest"    },
  { value: "price-asc",  key: "priceAsc"  },
  { value: "price-desc", key: "priceDesc" },
];

function formatPrice(cents: number) {
  return `₪${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

/* ─── Skeleton card ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-52 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-20 mt-2" />
      </div>
    </div>
  );
}

/* ─── Filter panel (outside ProductsPage to prevent focus loss) ── */
interface FilterPanelProps {
  search: string; setSearch: (v: string) => void;
  sort: string; setSort: (v: string) => void;
  categories: Category[];
  categorySlug: string; setCategorySlug: (v: string) => void;
  expandedCategorySlug: string; setExpandedCategorySlug: (v: string) => void;
  pricePreset: number | null; setPricePreset: (v: number | null) => void;
  minPriceInput: string; setMinPriceInput: (v: string) => void;
  maxPriceInput: string; setMaxPriceInput: (v: string) => void;
  setPage: (v: number) => void;
  t: (key: string, opts?: any) => string;
}

function FilterPanel({
  search, setSearch, sort, setSort, categories,
  categorySlug, setCategorySlug, expandedCategorySlug, setExpandedCategorySlug,
  pricePreset, setPricePreset, minPriceInput, setMinPriceInput,
  maxPriceInput, setMaxPriceInput, setPage, t,
}: FilterPanelProps) {
  return (
    <div className="space-y-7">

      {/* Search */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>{t("common.search")}</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t("products.title") + "…"}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5533]/50 transition"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>{t("common.sortBy")}</p>
        <div className="flex flex-col gap-1">
          {SORT_KEYS.map((o) => (
            <button
              key={o.value}
              onClick={() => { setSort(o.value); setPage(1); }}
              className={`text-left text-sm px-3 py-2 rounded-xl font-medium transition-all ${
                sort === o.value
                  ? "text-[#0F1F3D] font-bold"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
              style={sort === o.value ? { background: "#fff" } : {}}
            >
              {t(`products.sort.${o.key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>{t("common.category")}</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => { setCategorySlug(""); setExpandedCategorySlug(""); setPage(1); }}
            className={`text-left text-sm px-3 py-2 rounded-xl font-medium transition-all ${
              !categorySlug ? "text-[#0F1F3D] font-bold" : "text-white/85 hover:text-white hover:bg-white/10"
            }`}
            style={!categorySlug ? { background: "#fff" } : {}}
          >
            {t("common.allCategories")}
          </button>
          {categories.map((cat) => {
            const hasChildren = cat.children && cat.children.length > 0;
            const isExpanded = expandedCategorySlug === cat.slug;
            const isParentActive = categorySlug === cat.slug;
            const isChildActive = hasChildren && cat.children!.some(c => c.slug === categorySlug);
            return (
              <div key={cat.id}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      setExpandedCategorySlug(isExpanded ? "" : cat.slug);
                      setCategorySlug(cat.slug);
                    } else {
                      setCategorySlug(cat.slug);
                    }
                    setPage(1);
                  }}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl font-medium transition-all flex items-center justify-between ${
                    isParentActive || isChildActive
                      ? "text-white font-bold"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                  }`}
                  style={isParentActive || isChildActive ? { background: "#FF5533" } : {}}
                >
                  <span>{cat.name}</span>
                  {hasChildren && (
                    <ChevronRight
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""} ${isParentActive || isChildActive ? "text-white opacity-95" : "text-white opacity-75"}`}
                    />
                  )}
                </button>

                {/* Subcategories */}
                {hasChildren && isExpanded && (
                  <div className="ml-3 mt-1 mb-1 flex flex-col gap-0.5 border-l-2 pl-3" style={{ borderColor: "rgba(255,85,51,0.4)" }}>
                    {cat.children!.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => { setCategorySlug(child.slug); setPage(1); }}
                        className={`text-left text-sm px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                          categorySlug === child.slug
                            ? "text-white font-bold"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }`}
                        style={categorySlug === child.slug ? { background: "rgba(255,85,51,0.25)", color: "#FF9980" } : {}}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>{t("common.priceRange")}</p>
        <div className="flex flex-col gap-1 mb-4">
          {PRICE_PRESETS_CFG.map((preset, i) => (
            <button
              key={i}
              onClick={() => {
                setPricePreset(pricePreset === i ? null : i);
                setMinPriceInput(""); setMaxPriceInput(""); setPage(1);
              }}
              className={`text-left text-sm px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                pricePreset === i
                  ? "text-white font-bold"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
              style={pricePreset === i ? { background: "#FF5533" } : {}}
            >
              <Tag className="w-3 h-3 flex-shrink-0" />
              {t(`products.price.${preset.key}`)}
            </button>
          ))}
        </div>
        {/* Custom range inputs */}
        <p className="text-xs mb-2 font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>{t("common.customRange")}</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPriceInput}
            onChange={(e) => { setMinPriceInput(e.target.value); setPricePreset(null); setPage(1); }}
            placeholder={t("common.min")}
            min={0}
            className="w-full px-3 py-2 text-sm rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#FF5533]/50 transition"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          />
          <span className="font-bold flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>–</span>
          <input
            type="number"
            value={maxPriceInput}
            onChange={(e) => { setMaxPriceInput(e.target.value); setPricePreset(null); setPage(1); }}
            placeholder={t("common.max")}
            min={0}
            className="w-full px-3 py-2 text-sm rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#FF5533]/50 transition"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          />
        </div>
      </div>

    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [total, setTotal]           = useState(0);

  // Filters
  const [search, setSearch]               = useState("");
  const [sort, setSort]                   = useState("newest");
  const [categorySlug, setCategorySlug]       = useState("");
  const [expandedCategorySlug, setExpandedCategorySlug] = useState("");
  const [pricePreset, setPricePreset]     = useState<number | null>(null); // index into PRICE_PRESETS
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load root categories once
  useEffect(() => {
    categoryApi.getAll()
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Derive minPrice / maxPrice in cents
  const minCents = pricePreset !== null
    ? PRICE_PRESETS_CFG[pricePreset].min * 100
    : minPriceInput ? parseFloat(minPriceInput) * 100 : undefined;
  const maxCents = pricePreset !== null
    ? PRICE_PRESETS_CFG[pricePreset].max * 100
    : maxPriceInput ? parseFloat(maxPriceInput) * 100 : undefined;

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await productApi.search({
        page,
        limit: 12,
        search: search || undefined,
        sort,
        categorySlug: categorySlug || undefined,
        minPrice: minCents,
        maxPrice: maxCents,
      });
      setProducts(result.products || []);
      setTotalPages(result.pages || 1);
      setTotal(result.total ?? result.products?.length ?? 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sort, categorySlug, minCents, maxCents]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Count active filters
  const activeFilterCount = [
    categorySlug,
    pricePreset !== null || minPriceInput || maxPriceInput,
    search,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch(""); setCategorySlug(""); setExpandedCategorySlug("");
    setPricePreset(null); setMinPriceInput(""); setMaxPriceInput(""); setPage(1);
  };


  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100 px-6 py-10">
          <div className="max-w-7xl mx-auto flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#FF5533" }}>
                {t("common.catalogue")}
              </p>
              <h1 className="text-2xl sm:text-4xl font-black text-[#0F1F3D]">{t("products.title")}</h1>
              {!isLoading && (
                <p className="text-gray-500 text-sm mt-1">
                  {total > 0 ? t("products.found", { count: total }) : t("products.notFound")}
                </p>
              )}
            </div>

            {/* Active filter chips */}
            <div className="flex flex-wrap gap-2 items-center">
              {categorySlug && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#0F1F3D] text-white">
                  {categories.find(c => c.slug === categorySlug)?.name || categorySlug}
                  <button onClick={() => { setCategorySlug(""); setPage(1); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {pricePreset !== null && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#FF5533] text-white">
                  {t(`products.price.${PRICE_PRESETS_CFG[pricePreset].key}`)}
                  <button onClick={() => { setPricePreset(null); setPage(1); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(minPriceInput || maxPriceInput) && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#FF5533] text-white">
                  ₪{minPriceInput||"0"} – ₪{maxPriceInput||"∞"}
                  <button onClick={() => { setMinPriceInput(""); setMaxPriceInput(""); setPage(1); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gray-200 text-gray-700">
                  "{search}"
                  <button onClick={() => { setSearch(""); setPage(1); }}><X className="w-3 h-3" /></button>
                </span>
              )}

              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl text-white transition"
                style={{ background: "#0F1F3D" }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t("common.filters")} {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">

          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="rounded-2xl p-6 sticky top-24 shadow-lg" style={{ background: "#0F1F3D", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-white/60" />
                  <span className="font-black text-white text-sm">{t("common.filters")}</span>
                  {activeFilterCount > 0 && (
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: "#FF5533" }}>
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-white/60 hover:bg-[#FF5533] hover:text-white transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    {t("common.clearAll")}
                  </button>
                )}
              </div>
              <FilterPanel
                search={search} setSearch={setSearch}
                sort={sort} setSort={setSort}
                categories={categories}
                categorySlug={categorySlug} setCategorySlug={setCategorySlug}
                expandedCategorySlug={expandedCategorySlug} setExpandedCategorySlug={setExpandedCategorySlug}
                pricePreset={pricePreset} setPricePreset={setPricePreset}
                minPriceInput={minPriceInput} setMinPriceInput={setMinPriceInput}
                maxPriceInput={maxPriceInput} setMaxPriceInput={setMaxPriceInput}
                setPage={setPage} t={t}
              />
            </div>
          </aside>

          {/* ── Mobile filter drawer ── */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileFilterOpen(false)}
                  className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed left-0 top-0 h-full w-72 max-w-[85vw] z-50 overflow-y-auto p-6 pb-24 shadow-2xl lg:hidden"
                  style={{ background: "#0F1F3D" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-lg">{t("common.filters")}</span>
                      {activeFilterCount > 0 && (
                        <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: "#FF5533" }}>
                          {activeFilterCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearAll}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg text-white/60 hover:bg-[#FF5533] hover:text-white transition-all"
                          style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                        >
                          {t("common.clearAll")}
                        </button>
                      )}
                      <button onClick={() => setMobileFilterOpen(false)} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <FilterPanel
                search={search} setSearch={setSearch}
                sort={sort} setSort={setSort}
                categories={categories}
                categorySlug={categorySlug} setCategorySlug={setCategorySlug}
                expandedCategorySlug={expandedCategorySlug} setExpandedCategorySlug={setExpandedCategorySlug}
                pricePreset={pricePreset} setPricePreset={setPricePreset}
                minPriceInput={minPriceInput} setMinPriceInput={setMinPriceInput}
                maxPriceInput={maxPriceInput} setMaxPriceInput={setMaxPriceInput}
                setPage={setPage} t={t}
              />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Products grid ── */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-gray-400">
                <Package className="w-16 h-16 opacity-20 mb-4" />
                <p className="text-xl font-bold text-gray-600">{t("products.notFound")}</p>
                <p className="text-sm mt-1">{t("products.tryAdjusting")}</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="mt-4 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition hover:brightness-110"
                    style={{ background: "#FF5533" }}
                  >
                    {t("products.clearFilters")}
                  </button>
                )}
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (i % 6) * 0.05 }}
                    >
                      <Link href={`/products/${product.slug}`}>
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group h-full">
                          {/* Image */}
                          <div className="relative h-52 bg-[#F7F4EF] overflow-hidden">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-200" />
                              </div>
                            )}
                            {/* Discount badge */}
                            {product.compareAtPriceCents && product.priceCents &&
                             product.compareAtPriceCents > product.priceCents && (
                              <span className="absolute top-3 left-3 text-white text-[10px] font-black px-2 py-1 rounded-full" style={{ background: "#FF5533" }}>
                                -{Math.round(((product.compareAtPriceCents - product.priceCents) / product.compareAtPriceCents) * 100)}%
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            {product.brand && (
                              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{product.brand}</p>
                            )}
                            <h3 className="text-sm font-bold text-[#0F1F3D] line-clamp-2 leading-snug mb-3">
                              {product.title}
                            </h3>
                            <div className="flex items-baseline gap-2">
                              {product.priceCents ? (
                                <>
                                  <span className="text-lg font-black" style={{ color: "#FF5533" }}>
                                    {formatPrice(product.priceCents)}
                                  </span>
                                  {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatPrice(product.compareAtPriceCents)}
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
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#0F1F3D] hover:text-[#0F1F3D] disabled:opacity-30 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                          page === i + 1
                            ? "text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-[#0F1F3D]"
                        }`}
                        style={page === i + 1 ? { background: "#0F1F3D" } : {}}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#0F1F3D] hover:text-[#0F1F3D] disabled:opacity-30 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
