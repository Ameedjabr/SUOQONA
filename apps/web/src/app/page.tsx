"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/i18n";
import {
  ArrowRight, ChevronLeft, ChevronRight, Truck, RotateCcw, ShieldCheck, Tag, ShoppingBag,
} from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { categoryApi, productApi, Category, Product } from "@/services/api";

const BRAND_DARK   = "#0F1F3D";
const BRAND_ACCENT = "#FF5533";

const CAT_FALLBACK: Record<string, string> = {
  electronics: "#EEF2FF", clothing: "#FFF1F0", home: "#F0FDF4",
  sports: "#F0FDF4", accessories: "#FFF0F9", default: "#F7F4EF",
};

function formatPrice(cents: number) {
  return `₪${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export default function Home() {
  const { t } = useTranslation();
  const [categories, setCategories]   = useState<Category[]>([]);
  const [catsLoaded, setCatsLoaded]   = useState(false);
  const [slides, setSlides]           = useState<Product[]>([]);
  const [products, setProducts]       = useState<Product[]>([]);
  const [heroIndex, setHeroIndex]     = useState(0);

  useEffect(() => {
    categoryApi.getAll()
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setCatsLoaded(true));
  }, []);

  useEffect(() => {
    productApi.search({ limit: 20, status: "ACTIVE" }).then((res) => {
      const all = res.products || [];
      const withImg = all.filter((p: Product) => p.images?.length);
      setSlides(withImg.slice(0, 6));
      setProducts(all.slice(0, 8));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const cur = slides[heroIndex];

  const services = [
    { Icon: Truck,       key: "delivery"  },
    { Icon: RotateCcw,   key: "returns"   },
    { Icon: ShieldCheck, key: "payments"  },
    { Icon: Tag,         key: "prices"    },
  ] as const;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      {/* ══════ HERO ══════ */}
      <section className="relative overflow-hidden bg-[#F5F5F0]" style={{ height: "90vh", minHeight: 520 }}>
        <AnimatePresence mode="wait">
          {cur ? (
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="absolute inset-0"
            >
              <img src={cur.images![0].url} alt={cur.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
            </motion.div>
          ) : (
            <div className="absolute inset-0" style={{ background: BRAND_DARK }} />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col justify-end pb-24 md:pb-20 px-6 md:px-20 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg"
            >
              {cur?.brand && (
                <span className="inline-block text-white text-xs font-bold uppercase tracking-wider px-3 py-1 mb-4" style={{ background: BRAND_ACCENT }}>
                  {cur.brand}
                </span>
              )}
              <h1 className="text-white font-black leading-[1.08] mb-3" style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)" }}>
                {cur?.title ?? t("home.shopNow")}
              </h1>
              {cur?.priceCents && (
                <p className="text-white/80 text-xl font-semibold mb-6">
                  {t("home.from")} {formatPrice(cur.priceCents)}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Link href={cur ? `/products/${cur.slug}` : "/products"}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ background: BRAND_ACCENT, color: "#fff" }}
                    className="px-7 py-3 font-bold text-sm rounded hover:brightness-105 transition"
                  >
                    {t("home.shopNow")}
                  </motion.button>
                </Link>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-7 py-3 font-bold text-sm rounded border-2 border-white text-white hover:bg-white/15 transition"
                  >
                    {t("home.seeAllProducts")}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {slides.length > 1 && (
            <div className="flex gap-2 mt-8">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`rounded-full transition-all duration-300 ${i === heroIndex ? "w-7 h-2 bg-[#FF5533]" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
          )}
        </div>

        {slides.length > 1 && (
          <>
            <button onClick={() => setHeroIndex((i) => (i - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setHeroIndex((i) => (i + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </section>

      {/* ══════ PROMO STRIP ══════ */}
      <div style={{ background: BRAND_DARK }} className="py-3 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          {[...Array(2)].flatMap((_, copy) =>
            (t("home.promos", { returnObjects: true }) as string[]).map((msg, i) => (
              <span key={`${copy}-${i}`} className="text-white text-sm font-medium flex items-center gap-2 px-10 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5533] flex-shrink-0" />
                {msg}
              </span>
            ))
          )}
        </motion.div>
      </div>

      {/* ══════ SHOP BY CATEGORY ══════ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-[#111] font-black text-3xl md:text-4xl">{t("home.shopByCategory")}</h2>
            <Link href="/categories" className="text-sm font-bold hover:underline flex items-center gap-1" style={{ color: BRAND_ACCENT }}>
              {t("home.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!catsLoaded ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 5) * 0.07 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/categories/${cat.slug}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      className="group bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="h-32 overflow-hidden relative" style={{ background: CAT_FALLBACK[cat.slug] || CAT_FALLBACK.default }}>
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-[#0F1F3D] font-bold text-sm">{cat.name}</p>
                        <p className="text-xs font-semibold flex items-center gap-1 mt-0.5" style={{ color: BRAND_ACCENT }}>
                          {t("home.shop")} <ArrowRight className="w-3 h-3" />
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════ EDITORIAL SPLIT ══════ */}
      {slides.length >= 2 && (
        <section className="px-6 pb-16 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {slides.slice(0, 2).map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Link href={`/products/${product.slug}`}>
                  <div className="relative overflow-hidden rounded group cursor-pointer" style={{ height: 360 }}>
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-[#F5F5F0] flex items-center justify-center text-6xl">🛍️</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      {product.brand && (
                        <span className="inline-block text-white text-xs font-bold uppercase tracking-wider px-2 py-0.5 mb-2" style={{ background: BRAND_ACCENT }}>
                          {product.brand}
                        </span>
                      )}
                      <h3 className="text-white font-black text-xl leading-tight mb-1">{product.title}</h3>
                      {product.priceCents && (
                        <p className="text-white/80 text-sm font-semibold mb-3">{t("home.from")} {formatPrice(product.priceCents)}</p>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm font-bold px-5 py-2 rounded text-white" style={{ background: BRAND_ACCENT }}>
                        {t("home.shopNow")} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ══════ NEW ARRIVALS ══════ */}
      <section className="py-16 px-6 bg-[#F5F5F0]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: BRAND_ACCENT }}>{t("home.discover")}</p>
              <h2 className="text-[#111] font-black text-3xl md:text-4xl">{t("home.newAndPopular")}</h2>
            </div>
            <Link href="/products" className="text-sm font-bold hover:underline flex items-center gap-1" style={{ color: BRAND_ACCENT }}>
              {t("home.seeAll")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.length === 0
              ? [...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded overflow-hidden">
                    <div className="h-52 bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))
              : products.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: (i % 4) * 0.07 }} viewport={{ once: true }}>
                    <Link href={`/products/${product.slug}`}>
                      <motion.div whileHover={{ y: -4 }} className="bg-white rounded overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-52 bg-[#F5F5F0] overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">🛍️</div>
                          )}
                          {product.compareAtPriceCents && product.priceCents && product.compareAtPriceCents > product.priceCents && (
                            <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              -{Math.round(((product.compareAtPriceCents - product.priceCents) / product.compareAtPriceCents) * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          {product.brand && <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wide mb-0.5">{product.brand}</p>}
                          <h3 className="text-[#111] text-sm font-bold line-clamp-2 leading-snug mb-3">{product.title}</h3>
                          <div className="flex items-baseline gap-2">
                            {product.priceCents ? (
                              <>
                                <span className="text-[#111] font-black text-base">{formatPrice(product.priceCents)}</span>
                                {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                                  <span className="text-gray-400 text-xs line-through">{formatPrice(product.compareAtPriceCents)}</span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">{t("home.priceNotSet")}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ══════ WIDE PROMO BANNER ══════ */}
      {slides[2] && (
        <section className="px-6 py-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Link href={`/products/${slides[2].slug}`}>
                <div className="relative overflow-hidden rounded group cursor-pointer" style={{ height: 420 }}>
                  {slides[2].images?.[0]?.url && (
                    <img src={slides[2].images[0].url} alt={slides[2].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-20">
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND_ACCENT }}>{t("home.featured")}</p>
                    <h2 className="text-white font-black leading-[1.05] mb-4 max-w-md" style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}>
                      {slides[2].title}
                    </h2>
                    {slides[2].priceCents && (
                      <p className="text-white/80 text-lg font-semibold mb-6">{t("home.from")} {formatPrice(slides[2].priceCents)}</p>
                    )}
                    <span className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded w-fit" style={{ background: BRAND_ACCENT, color: "#fff" }}>
                      {t("home.shopNow")} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════ THREE-COLUMN MINI PROMOS ══════ */}
      {slides.length >= 6 && (
        <section className="px-6 pb-16 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {slides.slice(3, 6).map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
                <Link href={`/products/${product.slug}`}>
                  <div className="relative overflow-hidden rounded group cursor-pointer bg-[#F5F5F0]" style={{ height: 260 }}>
                    {product.images?.[0]?.url && (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-black text-base line-clamp-1 mb-1">{product.title}</h3>
                      {product.priceCents && <p className="text-white/80 text-sm font-semibold">{formatPrice(product.priceCents)}</p>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ══════ SERVICES ══════ */}
      <section className="py-16 px-6" style={{ background: BRAND_DARK }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white font-black text-3xl md:text-4xl text-center mb-12">{t("home.whyShopWithUs")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map(({ Icon, key }, i) => (
              <motion.div key={key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: BRAND_ACCENT }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{t(`home.services.${key}.title`)}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{t(`home.services.${key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ NEWSLETTER ══════ */}
      <section className="py-20 px-6 bg-[#F5F5F0]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND_ACCENT }}>{t("home.newsletter.label")}</p>
          <h2 className="text-[#111] font-black text-4xl md:text-5xl mb-3">{t("home.newsletter.title")}</h2>
          <p className="text-gray-500 text-base mb-8">{t("home.newsletter.subtitle")}</p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder={t("home.newsletter.placeholder")}
              required
              className="flex-1 px-5 py-3 border-2 border-gray-300 bg-white text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#FF5533] transition text-sm rounded"
            />
            <button type="submit" className="px-7 py-3 font-bold text-sm rounded flex-shrink-0 transition hover:brightness-105" style={{ background: BRAND_DARK, color: "white" }}>
              {t("home.newsletter.subscribe")}
            </button>
          </form>
        </motion.div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="py-20 px-6 bg-white text-center border-t border-gray-100">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-[#111] font-black leading-tight mb-8" style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
            {t("home.cta")}
          </h2>
          <Link href="/products">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-10 py-4 font-bold text-sm rounded transition hover:brightness-105" style={{ background: BRAND_ACCENT, color: "#fff" }}>
              {t("home.exploreAll")} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
}
